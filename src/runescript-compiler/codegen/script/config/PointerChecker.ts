import { Opcode } from '#/runescript-compiler/codegen/Opcode.js';
import { Instruction } from '#/runescript-compiler/codegen/Instruction.js';

import { RuneScript } from '#/runescript-compiler/codegen/script/RuneScript.js';

import { GraphGenerator } from '#/runescript-compiler/codegen/script/config/GraphGenerator.js';
import { InstructionNode } from '#/runescript-compiler/codegen/script/config/InstructionNode.js';
import { PointerInstructionNode } from '#/runescript-compiler/codegen/script/config/PointerInstructionNode.js';

import { Diagnostic } from '#/runescript-compiler/diagnostics/Diagnostic.js';
import { DiagnosticMessage } from '#/runescript-compiler/diagnostics/DiagnosticMessage.js';
import { Diagnostics } from '#/runescript-compiler/diagnostics/Diagnostics.js';
import { DiagnosticType } from '#/runescript-compiler/diagnostics/DiagnosticType.js';

import { PointerHolder } from '#/runescript-compiler/pointer/PointerHolder.js';
import { PointerType } from '#/runescript-compiler/pointer/PointerType.js';
import { StrictFeatureLevel } from '#/runescript-compiler/StrictFeatureLevel.js';

import { ScriptSymbol } from '#/runescript-compiler/symbol/ScriptSymbol.js';
import { BasicSymbol, LocalVariableSymbol } from '#/runescript-compiler/symbol/Symbol.js';

import { TriggerType } from '#/runescript-compiler/trigger/TriggerType.js';

import { MetaType } from '#/runescript-compiler/type/MetaType.js';
import { TupleType } from '#/runescript-compiler/type/TupleType.js';
import { Type } from '#/runescript-compiler/type/Type.js';
import { VarBitType, VarNpcType, VarPlayerType } from '#/runescript-compiler/type/wrapped/GameVarType.js';

type ScriptPointerAnalysis = {
    graph: InstructionNode[];
    required: InstructionNode[][];
    set: InstructionNode[][];
    corrupted: InstructionNode[][];
    setNodes: Set<InstructionNode>[];
    corruptedNodes: Set<InstructionNode>[];
    returns: InstructionNode[];
    staticLabelArgsByCall: Map<Instruction<any>, Map<number, ScriptSymbol>>;
};

export class PointerChecker {
    private static readonly LABEL_JUMP_COMMANDS = new Set(['jump', '.jump']);
    private static readonly ARG_PUSH_OPCODES = new Set([
        Opcode.PushConstantInt,
        Opcode.PushConstantString,
        Opcode.PushConstantLong,
        Opcode.PushConstantSymbol,
        Opcode.PushLocalVar,
        Opcode.PushVar,
        Opcode.PushVar2
    ]);

    /**
     * Mapping of a scripts symbol to the code generated script.
     */
    private readonly scriptsBySymbol: Map<ScriptSymbol, RuneScript>;

    /**
     * Local instance of the graph generator.
     */
    private readonly graphGenerator: GraphGenerator;

    /**
     * Cache of script graphs.
     */
    private readonly scriptGraphs = new Map<ScriptSymbol, InstructionNode[]>();

    /**
     * Cache of calculated [PointerHolder]s.
     */
    private readonly scriptPointers = new Map<ScriptSymbol, PointerHolder>();

    /**
     * Cache of pointer analysis per script.
     */
    private readonly scriptAnalyses = new Map<ScriptSymbol, ScriptPointerAnalysis>();

    /**
     * Cache of jump-parameter usage per script (parameter index -> jump command nodes).
     */
    private readonly jumpParamNodesByScript = new Map<ScriptSymbol, Map<number, InstructionNode[]>>();

    /**
     * Tracks scripts currently undergoing analysis to avoid recursive analysis.
     */
    private readonly pendingAnalyses = new Set<ScriptSymbol>();

    /**
     * Contains the scripts currently having their pointers calculated.
     */
    private readonly pendingScripts = new Set<ScriptSymbol>();

    constructor(
        private readonly diagnostics: Diagnostics,
        private readonly scripts: RuneScript[],
        private readonly commandPointers: Map<string, PointerHolder>,
        private readonly features: StrictFeatureLevel = {}
    ) {
        this.scriptsBySymbol = new Map(scripts.map(s => [s.symbol, s]));
        this.graphGenerator = new GraphGenerator(commandPointers, this.features);
    }

    /**
     * The control flow graph for the script.
     *
     * Generates using [GraphGenerator] and caches the result for all future calls.
     */
    getGraph(script: RuneScript): InstructionNode[] {
        const cached = this.scriptGraphs.get(script.symbol);
        if (cached) return cached;
        const graph = this.graphGenerator.generate(script.blocks);
        this.scriptGraphs.set(script.symbol, graph);
        return graph;
    }

    /**
     * [ScriptSymbol]
     * The pointer information for the script.
     *
     * Calculates using [calculatePointers] and caches the result for all future calls.
     */
    getPointers(symbol: ScriptSymbol): PointerHolder {
        const cached = this.scriptPointers.get(symbol);
        if (cached) return cached;

        const calculated = this.calculatePointers(symbol);
        this.scriptPointers.set(symbol, calculated);
        return calculated;
    }

    run(): void {
        for (const script of this.scripts) {
            const start = performance.now();
            this.validatePointers(script);
            const elapsed = performance.now() - start;
            //console.log(`Checked pointers for ${script.fullName} in ${elapsed.toFixed(2)}ms.`);
        }
    }
    /**
     * [ScriptSymbol]
     * Calculates the pointers a script requires, sets, and/or corrupts. This is generally
     * only called for scripts that are invokable (e.g. procs).
     *
     * @see pointers
     */
    private calculatePointers(symbol: ScriptSymbol): PointerHolder {
        if (this.pendingScripts.has(symbol)) {
            return { required: new Set(), set: new Set(), conditionalSet: false, corrupted: new Set() };
        }

        const script = this.scriptsBySymbol.get(symbol);
        if (!script) throw new Error(`Unable to find script from symbol: ${symbol.name}`);

        const required = new Set<PointerType>();
        const set = new Set<PointerType>();
        const corrupted = new Set<PointerType>();

        this.pendingScripts.add(symbol);
        for (const pointer of PointerType.ALL) {
            if (this.requiresPointerScript(script, pointer)) required.add(pointer);
            if (this.setsPointerScript(script, pointer)) set.add(pointer);
            if (this.corruptsPointerScript(script, pointer)) corrupted.add(pointer);
        }
        this.pendingScripts.delete(symbol);

        return { required, set, conditionalSet: false, corrupted };
    }

    /**
     * [RuneScript]
     */
    private validatePointers(script: RuneScript): void {
        for (const pointer of PointerType.ALL) {
            this.validatePointer(script, pointer);
        }
    }

    /**
     * [RuneScript]
     * Verifies that [pointer] is available everywhere that is it needed. If a pointer was deemed
     * not valid, an error is reported to [diagnostics].
     */
    private validatePointer(script: RuneScript, pointer: PointerType): void {
        const analysis = this.getAnalysis(script);
        const pointerIndex = this.pointerIndex(pointer);

        const graph = analysis.graph;
        const required = analysis.required[pointerIndex];
        const setNodes = analysis.setNodes[pointerIndex];
        let corrupted = analysis.corrupted[pointerIndex];
        let corruptedSet = analysis.corruptedNodes[pointerIndex];

        // Check if the trigger implicitly defines the pointer.
        if (!this.setsPointerTrigger(script.trigger, pointer)) {
            /**
             * If the trigger doesn't implicitly define the pointer we need to specify the starting
             * node as corrupting it so that there is a path found, resulting in an error.
             */
            if (graph.length > 0 && !corruptedSet.has(graph[0])) {
                corrupted = [...corrupted, graph[0]];
                corruptedSet = new Set(corruptedSet);
                corruptedSet.add(graph[0]);
            }
        }

        /**
         * Attempt to find a path between any of the nodes that require the pointer and any node
         * that corrupt the pointer.
         */
        const path = this.findEdgePath(
            required,
            node => corruptedSet.has(node),
            setNodes
        );

        /**
         * If a path was found then there is an error to raise.
         */
        if (path !== null) {
            const errorNode = path[0];
            const errorLocation =
                errorNode.instruction?.source ??
                (() => {
                    throw new Error('Unknown instruction source.');
                })();

            const corruptedNode = path[path.length - 1];
            const isCorrupted = corruptedNode !== graph[0] && corruptedNode !== errorNode;

            const message = isCorrupted ? DiagnosticMessage.POINTER_CORRUPTED : DiagnosticMessage.POINTER_UNINITIALIZED;

            this.diagnostics.report(new Diagnostic(DiagnosticType.ERROR, errorLocation, message, [pointer.representation]));

            if (isCorrupted) {
                const corruptedLocation =
                    corruptedNode.instruction?.source ??
                    (() => {
                        throw new Error('Unknown instruction source.');
                    })();

                this.diagnostics.report(new Diagnostic(DiagnosticType.HINT, corruptedLocation, DiagnosticMessage.POINTER_CORRUPTED_LOC, [pointer.representation]));
            }

            const logProcRequirement = (node: InstructionNode): void => {
                const inst = node.instruction;
                const opcode = inst?.opcode;
                if (opcode !== Opcode.Gosub && opcode !== Opcode.Jump) {
                    return;
                }

                const symbol = inst!.operand as ScriptSymbol;
                const calledScript = this.scriptsBySymbol.get(symbol) ?? this.scripts.find(s => s.symbol === symbol);
                if (!calledScript) {
                    throw new Error('Unable to find script.');
                }

                const scriptPath = this.requiresPointerPathScript(calledScript, pointer);
                if (!scriptPath) {
                    const staticArgs = analysis.staticLabelArgsByCall.get(inst!);
                    if (!staticArgs) {
                        return;
                    }

                    const jumpParamNodes = this.getJumpParamNodes(calledScript);
                    for (const [paramIndex, labelSymbol] of staticArgs.entries()) {
                        if (!this.getPointers(labelSymbol).required.has(pointer)) {
                            continue;
                        }

                        const nodes = jumpParamNodes.get(paramIndex);
                        if (!nodes || nodes.length === 0) {
                            continue;
                        }

                        if (!this.requiresPointerAtNodes(calledScript, pointer, nodes)) {
                            continue;
                        }

                        const requiredNode = nodes[0];
                        const requireLocation =
                            requiredNode.instruction?.source ??
                            (() => {
                                throw new Error('Invalid instruction/source.');
                            })();

                        this.diagnostics.report(new Diagnostic(DiagnosticType.HINT, requireLocation, DiagnosticMessage.POINTER_REQUIRED_LOC, [pointer.representation]));
                    }

                    return;
                }

                const requiredNode = scriptPath[0];
                const requireLocation =
                    requiredNode.instruction?.source ??
                    (() => {
                        throw new Error('Invalid instruction/source.');
                    })();

                this.diagnostics.report(new Diagnostic(DiagnosticType.HINT, requireLocation, DiagnosticMessage.POINTER_REQUIRED_LOC, [pointer.representation]));

                logProcRequirement(requiredNode);
            };

            logProcRequirement(errorNode);
        }
    }

    /**
     * Checks if the [TriggerType] sets [pointer] by default.
     */
    private setsPointerTrigger(trigger: TriggerType, pointer: PointerType): boolean {
        const pointers = trigger.pointers;
        return pointers != null && pointers.has(pointer);
    }

    /**
     * Checks if [RuneScript] requires the [pointer] to be called.
     */
    private requiresPointerScript(script: RuneScript, pointer: PointerType): boolean {
        return this.requiresPointerPathScript(script, pointer) !== null;
    }

    /**
     * Finds a path from instructions that require [pointer] to the first node without passing through
     * an instruction that sets the pointer.
     */
    private requiresPointerPathScript(script: RuneScript, pointer: PointerType): InstructionNode[] | null {
        const analysis = this.getAnalysis(script);
        const pointerIndex = this.pointerIndex(pointer);
        const usages = analysis.required[pointerIndex];

        return this.findEdgePath(usages, node => node === analysis.graph[0], analysis.setNodes[pointerIndex]);
    }

    /**
     * Checks if [RuneScript] sets the [pointer] after being called.
     */
    private setsPointerScript(script: RuneScript, pointer: PointerType): boolean {
        const analysis = this.getAnalysis(script);
        const pointerIndex = this.pointerIndex(pointer);

        return (
            this.findEdgePath(
                analysis.returns,
                node => node === analysis.graph[0] || analysis.corruptedNodes[pointerIndex].has(node),
                analysis.setNodes[pointerIndex]
            ) === null
        );
    }

    /**
     * Checks if [RuneScript] corrupts the [pointer] after being called.
     */
    private corruptsPointerScript(script: RuneScript, pointer: PointerType): boolean {
        const analysis = this.getAnalysis(script);
        const pointerIndex = this.pointerIndex(pointer);

        return (
            this.findEdgePath(
                analysis.returns,
                node => analysis.corruptedNodes[pointerIndex].has(node),
                analysis.setNodes[pointerIndex]
            ) !== null
        );
    }

    /**
     * [InstructionNode]
     * Checks if the instruction requires [pointer].
     */
    /**
     * Attempts to find a path starting from any neighbors of any nodes within [starts].
     */
    findEdgePath(starts: InstructionNode[], end: (node: InstructionNode) => boolean, blocked: Set<InstructionNode>): InstructionNode[] | null {
        if (!starts.length) return null;

        const sources = new Map<InstructionNode, InstructionNode | null>();
        const startSource = new Map<InstructionNode, InstructionNode | null>();
        const queue: InstructionNode[] = [];

        for (const start of starts) {
            for (const neighbor of start.previous) {
                if (blocked.has(neighbor)) continue;
                if (!sources.has(neighbor)) {
                    startSource.set(neighbor, start);
                    sources.set(neighbor, null);
                    queue.push(neighbor);
                }
            }
        }

        for (let i = 0; i < queue.length; i++) {
            const current = queue[i];
            if (end(current)) {
                const result: InstructionNode[] = [];
                let node: InstructionNode | undefined = current;
                while (node) {
                    result.unshift(node);
                    node = sources.get(node) ?? undefined;
                }
                result.unshift(startSource.get(result[0])!);
                return result;
            }

            for (const neighbor of current.previous) {
                if (blocked.has(neighbor)) continue;
                if (!sources.has(neighbor)) {
                    sources.set(neighbor, current);
                    queue.push(neighbor);
                }
            }
        }

        return null;
    }

    private pointerIndex(pointer: PointerType): number {
        const index = PointerType.INDEX.get(pointer);
        if (index == null) {
            throw new Error(`Unknown pointer type: ${pointer.representation}`);
        }
        return index;
    }

    private addPointer(target: InstructionNode[][], pointer: PointerType | null, node: InstructionNode): void {
        if (!pointer) return;
        target[this.pointerIndex(pointer)].push(node);
    }

    private addPointers(target: InstructionNode[][], pointers: Set<PointerType> | undefined, node: InstructionNode): void {
        if (!pointers || pointers.size === 0) return;
        for (const pointer of pointers) {
            target[this.pointerIndex(pointer)].push(node);
        }
    }

    private buildInstructionNodeMap(graph: InstructionNode[]): Map<Instruction<any>, InstructionNode> {
        const map = new Map<Instruction<any>, InstructionNode>();
        for (const node of graph) {
            if (node.instruction) {
                map.set(node.instruction, node);
            }
        }
        return map;
    }

    private findPreviousNonLineInstruction(instructions: Instruction<any>[], startIndex: number): Instruction<any> | null {
        for (let i = startIndex; i >= 0; i--) {
            const inst = instructions[i];
            if (inst.opcode === Opcode.LineNumber) continue;
            return inst;
        }
        return null;
    }

    private collectArgumentPushes(instructions: Instruction<any>[], callIndex: number, count: number): Instruction<any>[] | null {
        if (count <= 0) return [];
        const result: Instruction<any>[] = [];
        for (let i = callIndex - 1; i >= 0 && result.length < count; i--) {
            const inst = instructions[i];
            if (inst.opcode === Opcode.LineNumber) {
                continue;
            }
            if (!PointerChecker.ARG_PUSH_OPCODES.has(inst.opcode)) {
                return null;
            }
            result.push(inst);
        }
        if (result.length !== count) {
            return null;
        }
        result.reverse();
        return result;
    }

    private isLabelType(type: Type): boolean {
        return type instanceof MetaType.Script && type.trigger.identifier === 'label';
    }

    private isLabelScriptSymbol(symbol: ScriptSymbol): boolean {
        return symbol.trigger.identifier === 'label';
    }

    private buildStaticLabelArgsByCall(script: RuneScript): Map<Instruction<any>, Map<number, ScriptSymbol>> {
        const result = new Map<Instruction<any>, Map<number, ScriptSymbol>>();

        for (const block of script.blocks) {
            const instructions = block.instructions;
            for (let idx = 0; idx < instructions.length; idx++) {
                const inst = instructions[idx];
                if (inst.opcode === Opcode.LineNumber) continue;
                if (inst.opcode !== Opcode.Gosub && inst.opcode !== Opcode.Jump) continue;

                const symbol = inst.operand as ScriptSymbol;
                const paramTypes = TupleType.toList(symbol.parameters);
                if (paramTypes.length === 0) continue;

                const argPushes = this.collectArgumentPushes(instructions, idx, paramTypes.length);
                if (!argPushes) continue;

                const staticArgs = new Map<number, ScriptSymbol>();
                for (let paramIndex = 0; paramIndex < paramTypes.length; paramIndex++) {
                    const paramType = paramTypes[paramIndex];
                    if (!this.isLabelType(paramType)) continue;

                    const argInst = argPushes[paramIndex];
                    if (argInst.opcode !== Opcode.PushConstantSymbol) continue;

                    const argSymbol = argInst.operand as ScriptSymbol;
                    if (argSymbol instanceof ScriptSymbol && this.isLabelScriptSymbol(argSymbol)) {
                        staticArgs.set(paramIndex, argSymbol);
                    }
                }

                if (staticArgs.size > 0) {
                    result.set(inst, staticArgs);
                }
            }
        }

        return result;
    }

    private getJumpParamNodes(script: RuneScript, instructionToNode?: Map<Instruction<any>, InstructionNode>): Map<number, InstructionNode[]> {
        const cached = this.jumpParamNodesByScript.get(script.symbol);
        if (cached) return cached;

        const nodeMap = instructionToNode ?? this.buildInstructionNodeMap(this.getGraph(script));
        const paramIndexBySymbol = new Map<LocalVariableSymbol, number>();
        for (let i = 0; i < script.locals.parameters.length; i++) {
            paramIndexBySymbol.set(script.locals.parameters[i], i);
        }

        const jumpParamNodes = new Map<number, InstructionNode[]>();

        for (const block of script.blocks) {
            const instructions = block.instructions;
            for (let idx = 0; idx < instructions.length; idx++) {
                const inst = instructions[idx];
                if (inst.opcode === Opcode.LineNumber) continue;
                if (inst.opcode !== Opcode.Command) continue;

                const command = inst.operand as ScriptSymbol;
                if (!PointerChecker.LABEL_JUMP_COMMANDS.has(command.name)) continue;

                const prev = this.findPreviousNonLineInstruction(instructions, idx - 1);
                if (!prev || prev.opcode !== Opcode.PushLocalVar) continue;

                const local = prev.operand as LocalVariableSymbol;
                const paramIndex = paramIndexBySymbol.get(local);
                if (paramIndex == null) continue;

                const paramType = script.locals.parameters[paramIndex]?.type;
                if (!paramType || !this.isLabelType(paramType)) continue;

                const node = nodeMap.get(inst);
                if (!node) continue;

                let list = jumpParamNodes.get(paramIndex);
                if (!list) {
                    list = [];
                    jumpParamNodes.set(paramIndex, list);
                }
                list.push(node);
            }
        }

        this.jumpParamNodesByScript.set(script.symbol, jumpParamNodes);
        return jumpParamNodes;
    }

    private requiresPointerAtNodes(script: RuneScript, pointer: PointerType, nodes: InstructionNode[]): boolean {
        if (!nodes.length) return false;
        const analysis = this.getAnalysis(script);
        const pointerIndex = this.pointerIndex(pointer);
        return this.findEdgePath(nodes, node => node === analysis.graph[0], analysis.setNodes[pointerIndex]) !== null;
    }

    private addStaticLabelRequirements(
        required: InstructionNode[][],
        callerNode: InstructionNode,
        calledSymbol: ScriptSymbol,
        staticLabelArgs: Map<number, ScriptSymbol>
    ): void {
        const calledScript = this.scriptsBySymbol.get(calledSymbol);
        if (!calledScript) return;

        const jumpParamNodes = this.getJumpParamNodes(calledScript);
        if (!jumpParamNodes.size) return;

        for (const [paramIndex, labelSymbol] of staticLabelArgs.entries()) {
            const nodes = jumpParamNodes.get(paramIndex);
            if (!nodes || nodes.length === 0) continue;

            const labelPointers = this.getPointers(labelSymbol);
            for (const pointer of labelPointers.required) {
                if (this.requiresPointerAtNodes(calledScript, pointer, nodes)) {
                    this.addPointer(required, pointer, callerNode);
                }
            }
        }
    }

    private getAnalysis(script: RuneScript): ScriptPointerAnalysis {
        const cached = this.scriptAnalyses.get(script.symbol);
        if (cached) return cached;

        const graph = this.getGraph(script);
        if (this.pendingAnalyses.has(script.symbol)) {
            return this.createEmptyAnalysis(graph);
        }

        this.pendingAnalyses.add(script.symbol);
        const instructionToNode = this.buildInstructionNodeMap(graph);
        const staticLabelArgsByCall = this.buildStaticLabelArgsByCall(script);
        this.getJumpParamNodes(script, instructionToNode);
        const pointerCount = PointerType.ALL.length;
        const required: InstructionNode[][] = Array.from({ length: pointerCount }, () => []);
        const set: InstructionNode[][] = Array.from({ length: pointerCount }, () => []);
        const corrupted: InstructionNode[][] = Array.from({ length: pointerCount }, () => []);
        const returns: InstructionNode[] = [];

        try {
            for (const node of graph) {
                if (node instanceof PointerInstructionNode) {
                    this.addPointers(set, node.set, node);
                    continue;
                }

                const inst = node.instruction;
                if (!inst) continue;

                if (inst.opcode === Opcode.Return) {
                    returns.push(node);
                }

                switch (inst.opcode) {
                    case Opcode.Command: {
                        const command = inst.operand as ScriptSymbol;
                        const pointers = this.commandPointers.get(command.name);
                        if (pointers) {
                            this.addPointers(required, pointers.required, node);
                            this.addPointers(corrupted, pointers.corrupted, node);
                            if (!pointers.conditionalSet) {
                                this.addPointers(set, pointers.set, node);
                            }
                        }
                        break;
                    }

                    case Opcode.Gosub:
                    case Opcode.Jump: {
                        const symbol = inst.operand as ScriptSymbol;
                        const pointers = this.getPointers(symbol);
                        this.addPointers(required, pointers.required, node);
                        this.addPointers(set, pointers.set, node);
                        this.addPointers(corrupted, pointers.corrupted, node);
                        const staticLabelArgs = staticLabelArgsByCall.get(inst);
                        if (staticLabelArgs) {
                            this.addStaticLabelRequirements(required, node, symbol, staticLabelArgs);
                        }
                        break;
                    }

                    case Opcode.PushVar: {
                        const symbol = inst.operand as BasicSymbol;
                        const type = symbol.type;
                        if (type instanceof VarPlayerType || type instanceof VarBitType) {
                            this.addPointer(required, PointerType.ACTIVE_PLAYER, node);
                        } else if (type instanceof VarNpcType) {
                            this.addPointer(required, PointerType.ACTIVE_NPC, node);
                        }
                        break;
                    }

                    case Opcode.PopVar: {
                        const symbol = inst.operand as BasicSymbol;
                        const type = symbol.type;
                        if (type instanceof VarPlayerType || type instanceof VarBitType) {
                            this.addPointer(required, symbol.isProtected ? PointerType.P_ACTIVE_PLAYER : PointerType.ACTIVE_PLAYER, node);
                        } else if (type instanceof VarNpcType) {
                            this.addPointer(required, PointerType.ACTIVE_NPC, node);
                        }
                        break;
                    }

                    case Opcode.PushVar2: {
                        const symbol = inst.operand as BasicSymbol;
                        const type = symbol.type;
                        if (type instanceof VarPlayerType || type instanceof VarBitType) {
                            this.addPointer(required, PointerType.ACTIVE_PLAYER2, node);
                        } else if (type instanceof VarNpcType) {
                            this.addPointer(required, PointerType.ACTIVE_NPC2, node);
                        }
                        break;
                    }

                    case Opcode.PopVar2: {
                        const symbol = inst.operand as BasicSymbol;
                        const type = symbol.type;
                        if (type instanceof VarPlayerType || type instanceof VarBitType) {
                            this.addPointer(required, symbol.isProtected ? PointerType.P_ACTIVE_PLAYER2 : PointerType.ACTIVE_PLAYER2, node);
                        } else if (type instanceof VarNpcType) {
                            this.addPointer(required, PointerType.ACTIVE_NPC2, node);
                        }
                        break;
                    }

                    default:
                        break;
                }
            }
        } finally {
            this.pendingAnalyses.delete(script.symbol);
        }

        const analysis: ScriptPointerAnalysis = {
            graph,
            required,
            set,
            corrupted,
            setNodes: set.map(nodes => new Set(nodes)),
            corruptedNodes: corrupted.map(nodes => new Set(nodes)),
            returns,
            staticLabelArgsByCall
        };

        this.scriptAnalyses.set(script.symbol, analysis);
        return analysis;
    }

    private createEmptyAnalysis(graph: InstructionNode[]): ScriptPointerAnalysis {
        const pointerCount = PointerType.ALL.length;
        const required: InstructionNode[][] = Array.from({ length: pointerCount }, () => []);
        const set: InstructionNode[][] = Array.from({ length: pointerCount }, () => []);
        const corrupted: InstructionNode[][] = Array.from({ length: pointerCount }, () => []);
        const returns: InstructionNode[] = [];
        const staticLabelArgsByCall = new Map<Instruction<any>, Map<number, ScriptSymbol>>();

        for (const node of graph) {
            if (node.instruction?.opcode === Opcode.Return) {
                returns.push(node);
            }
        }

        return {
            graph,
            required,
            set,
            corrupted,
            setNodes: set.map(nodes => new Set(nodes)),
            corruptedNodes: corrupted.map(nodes => new Set(nodes)),
            returns,
            staticLabelArgsByCall
        };
    }
}
