import { Diagnostic } from '#/runescript-compiler/diagnostics/Diagnostic.js';
import { DiagnosticMessage } from '#/runescript-compiler/diagnostics/DiagnosticMessage.js';
import { Diagnostics } from '#/runescript-compiler/diagnostics/Diagnostics.js';
import { DiagnosticType } from '#/runescript-compiler/diagnostics/DiagnosticType.js';
import { PointerHolder } from '#/runescript-compiler/pointer/PointerHolder.js';
import { PointerType } from '#/runescript-compiler/pointer/PointerType.js';
import { ScriptSymbol } from '#/runescript-compiler/symbol/ScriptSymbol.js';
import { BasicSymbol } from '#/runescript-compiler/symbol/Symbol.js';
import { TriggerType } from '#/runescript-compiler/trigger/TriggerType.js';
import { VarBitType, VarNpcType, VarPlayerType } from '#/runescript-compiler/type/wrapped/GameVarType.js';
import { Opcode } from '#/runescript-compiler/codegen/Opcode.js';
import { RuneScript } from '#/runescript-compiler/codegen/script/RuneScript.js';
import { GraphGenerator } from '#/runescript-compiler/codegen/script/config/GraphGenerator.js';
import { InstructionNode } from '#/runescript-compiler/codegen/script/config/InstructionNode.js';
import { PointerInstructionNode } from '#/runescript-compiler/codegen/script/config/PointerInstructionNode.js';

export class PointerChecker {
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
     * Contains the scripts currently having their pointers calculated.
     */
    private readonly pendingScripts = new Set<ScriptSymbol>();

    constructor(
        private readonly diagnostics: Diagnostics,
        private readonly scripts: RuneScript[],
        private readonly commandPointers: Map<string, PointerHolder>
    ) {
        this.scriptsBySymbol = new Map(scripts.map(s => [s.symbol, s]));
        this.graphGenerator = new GraphGenerator(commandPointers);
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
        const graph = this.getGraph(script);

        const required = graph.filter(node => this.requiresPointerNode(node, pointer));
        const set = graph.filter(node => this.setsPointerNode(node, pointer));
        const corrupted = graph.filter(node => this.corruptsPointerNode(node, pointer));

        // Check if the trigger implicitly defines the pointer.
        if (!this.setsPointerTrigger(script.trigger, pointer)) {
            /**
             * If the trigger doesn't implicitly define the pointer we need to specify the starting
             * node as corrupting it so that there is a path found, resulting in an error.
             */
            if (graph.length > 0) corrupted.push(graph[0]);
        }

        /**
         * Attempt to find a path between any of the nodes that require the pointer and any node
         * that corrupt the pointer.
         */
        const path = this.findEdgePath(
            required,
            node => corrupted.includes(node),
            node => node.previous.filter(prev => !set.includes(prev))
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
                const opcode = node.instruction?.opcode;
                if (opcode !== Opcode.Gosub && opcode !== Opcode.Jump) {
                    return;
                }

                const symbol = node.instruction!.operand as ScriptSymbol;
                const calledScript = this.scripts.find(s => s.symbol === symbol);
                if (!calledScript) {
                    throw new Error('Unable to find script.');
                }

                const scriptPath = this.requiresPointerPathScript(calledScript, pointer);
                if (!scriptPath) {
                    throw new Error('Unable to find requirement path?');
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
        const graph = this.getGraph(script);
        const usages = graph.filter(node => this.requiresPointerNode(node, pointer));

        return this.findEdgePath(
            usages,
            node => node === graph[0],
            node => node.previous.filter(prev => !this.setsPointerNode(prev, pointer))
        );
    }

    /**
     * Checks if [RuneScript] sets the [pointer] after being called.
     */
    private setsPointerScript(script: RuneScript, pointer: PointerType): boolean {
        const graph = this.getGraph(script);
        const returns = graph.filter(n => n.instruction?.opcode === Opcode.Return);

        return (
            this.findEdgePath(
                returns,
                node => node === graph[0] || this.corruptsPointerNode(node, pointer),
                node => node.previous.filter(prev => !this.setsPointerNode(prev, pointer))
            ) === null
        );
    }

    /**
     * Checks if [RuneScript] corrupts the [pointer] after being called.
     */
    private corruptsPointerScript(script: RuneScript, pointer: PointerType): boolean {
        const graph = this.getGraph(script);

        const returns = graph.filter(node => node.instruction?.opcode === Opcode.Return);

        return (
            this.findEdgePath(
                returns,
                node => this.corruptsPointerNode(node, pointer),
                node => node.previous.filter(prev => !this.setsPointerNode(prev, pointer))
            ) !== null
        );
    }

    /**
     * [InstructionNode]
     * Checks if the instruction requires [pointer].
     */
    private requiresPointerNode(node: InstructionNode, pointer: PointerType): boolean {
        const inst = node.instruction;
        if (!inst) return false;

        switch (inst.opcode) {
            case Opcode.Command: {
                const command = inst.operand as ScriptSymbol;
                const pointers = this.commandPointers.get(command.name);
                return pointers ? pointers.required.has(pointer) : false;
            }

            case Opcode.Gosub:
            case Opcode.Jump: {
                const symbol = inst.operand as ScriptSymbol;
                return this.getPointers(symbol).required.has(pointer);
            }

            case Opcode.PushVar: {
                const symbol = inst.operand as BasicSymbol;
                const type = symbol.type;

                if (type instanceof VarPlayerType) return pointer === PointerType.ACTIVE_PLAYER;
                if (type instanceof VarBitType) return pointer === PointerType.ACTIVE_PLAYER;
                if (type instanceof VarNpcType) return pointer === PointerType.ACTIVE_NPC;
                return false;
            }

            case Opcode.PopVar: {
                const symbol = inst.operand as BasicSymbol;
                const type = symbol.type;

                if (type instanceof VarPlayerType || type instanceof VarBitType) {
                    return symbol.isProtected ? pointer === PointerType.P_ACTIVE_PLAYER : pointer === PointerType.ACTIVE_PLAYER;
                }

                if (type instanceof VarNpcType) {
                    return pointer === PointerType.ACTIVE_NPC;
                }

                return false;
            }

            case Opcode.PushVar2: {
                const symbol = inst.operand as BasicSymbol;
                const type = symbol.type;

                if (type instanceof VarPlayerType) return pointer === PointerType.ACTIVE_PLAYER2;
                if (type instanceof VarBitType) return pointer === PointerType.ACTIVE_PLAYER2;
                if (type instanceof VarNpcType) return pointer === PointerType.ACTIVE_NPC2;
                return false;
            }

            case Opcode.PopVar2: {
                const symbol = inst.operand as BasicSymbol;
                const type = symbol.type;

                if (type instanceof VarPlayerType || type instanceof VarBitType) {
                    return symbol.isProtected ? pointer === PointerType.P_ACTIVE_PLAYER2 : pointer === PointerType.ACTIVE_PLAYER2;
                }

                if (type instanceof VarNpcType) {
                    return pointer === PointerType.ACTIVE_NPC2;
                }

                return false;
            }

            default:
                return false;
        }
    }

    /**
     * [InstructionNode]
     * Checks if the instruction sets [pointer].
     */
    private setsPointerNode(node: InstructionNode, pointer: PointerType): boolean {
        if (node instanceof PointerInstructionNode) {
            // Special node inserted for commands that conditionally set a pointer.
            return node.set.has(pointer);
        }

        const inst = node.instruction;
        if (!inst) return false;

        switch (inst.opcode) {
            case Opcode.Command: {
                const command = inst.operand as ScriptSymbol;
                const pointers = this.commandPointers.get(command.name);
                return pointers ? pointers.set.has(pointer) && !pointers.conditionalSet : false;
            }
            case Opcode.Gosub: {
                const symbol = inst.operand as ScriptSymbol;
                const pointers = this.getPointers(symbol);
                return pointers.set.has(pointer);
            }
            default:
                return false;
        }
    }

    /**
     * [InstructionNode]
     * Checks if the instruction corrupts [pointer].
     */
    private corruptsPointerNode(node: InstructionNode, pointer: PointerType): boolean {
        const inst = node.instruction;
        if (!inst) return false;

        switch (inst.opcode) {
            case Opcode.Command: {
                const command = inst.operand as ScriptSymbol;
                const pointers = this.commandPointers.get(command.name);
                return pointers ? pointers.corrupted.has(pointer) : false;
            }
            case Opcode.Gosub: {
                const symbol = inst.operand as ScriptSymbol;
                const pointers = this.getPointers(symbol);
                return pointers.corrupted.has(pointer);
            }
            default:
                return false;
        }
    }

    /**
     * Attempts to find a path starting from any neighbors of any nodes within [starts].
     */
    findEdgePath(starts: InstructionNode[], end: (node: InstructionNode) => boolean, getNeighbors: (node: InstructionNode) => InstructionNode[]): InstructionNode[] | null {
        if (!starts.length) return null;

        const sources = new Map<InstructionNode, InstructionNode | null>();
        const startSource = new Map<InstructionNode, InstructionNode | null>();
        const queue: InstructionNode[] = [];

        for (const start of starts) {
            for (const neighbor of getNeighbors(start)) {
                if (!sources.has(neighbor)) {
                    startSource.set(neighbor, start);
                    sources.set(neighbor, null);
                    queue.push(neighbor);
                }
            }
        }

        while (queue.length) {
            const current = queue.shift()!;
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

            for (const neighbor of getNeighbors(current)) {
                if (!sources.has(neighbor)) {
                    sources.set(neighbor, current);
                    queue.push(neighbor);
                }
            }
        }

        return null;
    }
}
