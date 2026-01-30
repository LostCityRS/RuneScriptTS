import { Diagnostic } from '../../../diagnostics/Diagnostic';
import { DiagnosticMessage } from '../../../diagnostics/DiagnosticMessage';
import { Diagnostics } from '../../../diagnostics/Diagnostics';
import { DiagnosticType } from '../../../diagnostics/DiagnosticType';
import { PointerHolder } from '../../../pointer/PointerHolder';
import { PointerType } from '../../../pointer/PointerType';
import { ScriptSymbol } from '../../../symbol/ScriptSymbol';
import { BasicSymbol } from '../../../symbol/Symbol';
import { VarBitType, VarNpcType, VarPlayerType } from '../../../type/wrapped/GameVarType';
import { Opcode } from '../../Opcode';
import { RuneScript } from '../RuneScript';
import { GraphGenerator } from './GraphGenerator';
import { InstructionNode } from './InstructionNode';
import { PointerInstructionNode } from './PointerInstructionNode';

export class PointerChecker {
    private readonly scriptsBySymbol: Map<ScriptSymbol, RuneScript>;
    private readonly graphGenerator: GraphGenerator;
    private readonly scriptGraphs = new Map<ScriptSymbol, InstructionNode[]>();
    private readonly scriptPointers = new Map<ScriptSymbol, PointerHolder>();
    private readonly pendingScripts = new Set<ScriptSymbol>();

    constructor(
        private readonly diagnostics: Diagnostics,
        private readonly scripts: RuneScript[],
        private readonly commandPointers: Map<string, PointerHolder>
    ) {
        this.scriptsBySymbol = new Map(scripts.map(s => [s.symbol, s]));
        this.graphGenerator = new GraphGenerator(commandPointers);
    }

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
            console.log(`Checked pointers for ${script.fullName} in ${elapsed.toFixed(2)}ms.`);
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
            if (this.requiresPointer(script, pointer)) required.add(pointer);
            if (this.setsPointer(script, pointer)) set.add(pointer);
            if (this.corruptsPointer(script, pointer)) corrupted.add(pointer);
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
     */
    private validatePointer(script: RuneScript, pointer: PointerType): void {
        const graph = this.getGraph(script);

        const required = graph.filter(node => this.requiresPointer(node, pointer));
        const set = graph.filter(node => this.setsPointer(node, pointer));
    }

    private corruptsPointer(script: RuneScript, pointer: PointerType): boolean {
        const graph = this.getGraph(script);

        const returns = graph.filter(
            node => node.instruction?.opcode === Opcode.Return;
        );

        return this.findEdgePath(
            returns,
            node => this.corruptsPointerNode(node, pointer),
            node => node.previous.filter(prev => !this.setsPointer(prev, pointer))
        ) !== null;
    }

    /**
     * [InstructionNode]
     * Checks if the instruction requires [pointer].
     */
    private requiresPointer(node: InstructionNode, pointer: PointerType): boolean {
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
                    return symbol.isProtected
                        ? pointer === PointerType.P_ACTIVE_PLAYER
                        : pointer === PointerType.ACTIVE_PLAYER
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
                    return symbol.isProtected
                        ? pointer === PointerType.P_ACTIVE_PLAYER2
                        : pointer === PointerType.ACTIVE_PLAYER2
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
    private setsPointer(node: InstructionNode, pointer: PointerType): boolean {
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
    private corruptsPointer(node: InstructionNode, pointer: PointerType): boolean {
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
    findEdgePath(
        starts: InstructionNode[],
        end: (node: InstructionNode) => boolean,
        getNeighbors: (node: InstructionNode) => InstructionNode[]
    ): InstructionNode[] | null {
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