import { Instruction } from '#/runescript-compiler/codegen/Instruction.js';
import { Opcode } from '#/runescript-compiler/codegen/Opcode.js';

import { Block } from '#/runescript-compiler/codegen/script/Block.js';
import { Label } from '#/runescript-compiler/codegen/script/Label.js';
import { SwitchTable } from '#/runescript-compiler/codegen/script/SwitchTable.js';

import { InstructionNode } from '#/runescript-compiler/codegen/script/config/InstructionNode.js';
import { PointerInstructionNode } from '#/runescript-compiler/codegen/script/config/PointerInstructionNode.js';

import { PointerHolder } from '#/runescript-compiler/pointer/PointerHolder.js';

import { StrictFeatureLevel } from '#/runescript-compiler/StrictFeatureLevel.js';

import { ScriptSymbol } from '#/runescript-compiler/symbol/ScriptSymbol.js';

export class GraphGenerator {
    private readonly commandPointers: Map<string, PointerHolder>;
    private readonly allowPointerInversion: boolean;

    constructor(commandPointers: Map<string, PointerHolder>, features: StrictFeatureLevel = {}) {
        this.commandPointers = commandPointers;
        this.allowPointerInversion = features.pointerInversion !== false;
    }

    public generate(blocks: Block[]): InstructionNode[] {
        const nodeCache = new Map<Instruction<any>, InstructionNode>();
        const nodes: InstructionNode[] = [];

        const labelToBlock = new Map<Label, Block>();
        const blockIndex = new Map<Block, number>();
        const firstValidByBlock = new Map<Block, Instruction<any> | null>();

        for (let i = 0; i < blocks.length; i++) {
            const block = blocks[i];
            blockIndex.set(block, i);
            labelToBlock.set(block.label, block);
            firstValidByBlock.set(block, this.firstValid(block.instructions));
        }

        const start = new InstructionNode(null);
        start.addNext(this.firstInstruction(blocks[0], nodeCache, blocks, blockIndex, firstValidByBlock));
        nodes.push(start);

        let potentialConditionalPointer = false;

        for (let blockIdx = 0; blockIdx < blocks.length; blockIdx++) {
            const block = blocks[blockIdx];

            for (let instructionIdx = 0; instructionIdx < block.instructions.length; instructionIdx++) {
                const instruction = block.instructions[instructionIdx];

                if (instruction.opcode === Opcode.LineNumber) {
                    continue;
                }

                const node = this.getOrCreate(nodeCache, instruction);
                nodes.push(node);

                if (potentialConditionalPointer && instruction.opcode === Opcode.BranchEquals && this.checkInvertedConditional(block.instructions, instructionIdx)) {
                    /**
                     * CONVERT:
                     *              branch_equals
                     *             /             \
                     *       branch if_end      code
                     * INTO:
                     *              branch_equals
                     *             /             \
                     *       setpointer         code
                     *      /
                     * branch if_end
                     */
                    if (this.allowPointerInversion) {
                        if (instructionIdx + 1 >= block.instructions.length) {
                            throw new Error('Invalid inverted conditional layout');
                        }

                        const next = block.instructions[instructionIdx + 1];
                        const nextNode = this.getOrCreate(nodeCache, next);

                        if (next.opcode !== Opcode.Branch) {
                            throw new Error('Expected Branch opcode');
                        }

                        const commandInst = block.instructions[instructionIdx - 2];
                        if (commandInst.opcode !== Opcode.Command) {
                            throw new Error('Expected command before conditional');
                        }

                        const commandName = (commandInst.operand as ScriptSymbol).name;
                        const pointers = this.commandPointers.get(commandName)!.set;

                        const setPointerNode = new PointerInstructionNode(pointers);
                        nodes.push(setPointerNode);

                        node.addNext(setPointerNode);
                        setPointerNode.addNext(nextNode);
                    } else if (!TERMINAL_OPCODES.has(instruction.opcode)) {
                        let next: Instruction<any>;

                        if (instructionIdx + 1 < block.instructions.length) {
                            next = block.instructions[instructionIdx + 1];
                        } else if (blockIdx + 1 < blocks.length) {
                            next = blocks[blockIdx + 1].instructions[0];
                        } else {
                            throw new Error('No next instruction');
                        }

                        node.addNext(this.getOrCreate(nodeCache, next));
                    }

                    potentialConditionalPointer = false;
                } else if (!TERMINAL_OPCODES.has(instruction.opcode)) {
                    let next: Instruction<any>;

                    if (instructionIdx + 1 < block.instructions.length) {
                        next = block.instructions[instructionIdx + 1];
                    } else if (blockIdx + 1 < blocks.length) {
                        next = blocks[blockIdx + 1].instructions[0];
                    } else {
                        throw new Error('No next instruction');
                    }

                    node.addNext(this.getOrCreate(nodeCache, next));
                }

                if (potentialConditionalPointer && instruction.opcode === Opcode.BranchEquals && this.checkConditional(block.instructions, instructionIdx)) {
                    const label = instruction.operand as Label;
                    const jumpBlock = labelToBlock.get(label);
                    if (!jumpBlock) {
                        throw new Error('Unable to find block.');
                    }

                    const commandInst = block.instructions[instructionIdx - 2];
                    if (commandInst.opcode !== Opcode.Command) {
                        throw new Error('Expected command before conditional.');
                    }

                    const commandName = (commandInst.operand as ScriptSymbol).name;
                    const pointers = this.commandPointers.get(commandName)!.set;

                    const setPointerNode = new PointerInstructionNode(pointers);
                    nodes.push(setPointerNode);

                    node.addNext(setPointerNode);
                    setPointerNode.addNext(this.firstInstruction(jumpBlock, nodeCache, blocks, blockIndex, firstValidByBlock));

                    potentialConditionalPointer = false;
                } else if (BRANCH_OPCODES.has(instruction.opcode)) {
                    const label = instruction.operand as Label;
                    const jumpBlock = labelToBlock.get(label);
                    if (!jumpBlock) {
                        throw new Error('Unable to find block.');
                    }

                    node.addNext(this.firstInstruction(jumpBlock, nodeCache, blocks, blockIndex, firstValidByBlock));
                } else if (instruction.opcode === Opcode.Switch) {
                    const table = instruction.operand as SwitchTable;

                    for (const c of table.cases) {
                        if (c.keys.length === 0) {
                            continue;
                        }

                        const jumpBlock = labelToBlock.get(c.label);
                        if (!jumpBlock) {
                            throw new Error('Unable to find block.');
                        }

                        node.addNext(this.firstInstruction(jumpBlock, nodeCache, blocks, blockIndex, firstValidByBlock));
                    }
                }

                if (this.isConditionalPointerSetter(instruction)) {
                    potentialConditionalPointer = true;
                }
            }
        }

        return nodes;
    }

    private checkConditional(instructions: Instruction<any>[], instructionIdx: number): boolean {
        if (instructionIdx < 2) return false;

        const inst1 = instructions[instructionIdx - 2];
        if (!this.isConditionalPointerSetter(inst1)) return false;

        const inst2 = instructions[instructionIdx - 1];
        return inst2.opcode === Opcode.PushConstantInt && inst2.operand === 1;
    }

    private checkInvertedConditional(instructions: Instruction<any>[], instructionIdx: number): boolean {
        if (instructionIdx < 2) return false;

        const inst1 = instructions[instructionIdx - 2];
        if (!this.isConditionalPointerSetter(inst1)) return false;

        const inst2 = instructions[instructionIdx - 1];
        return inst2.opcode === Opcode.PushConstantInt && inst2.operand === 0;
    }

    private isConditionalPointerSetter(instruction: Instruction<any>): boolean {
        if (instruction.opcode == Opcode.Command && instruction.operand instanceof ScriptSymbol) {
            const holder = this.commandPointers.get(instruction.operand.name);
            return holder !== undefined && holder.conditionalSet;
        }
        return false;
    }

    private firstInstruction(
        block: Block,
        cache: Map<Instruction<any>, InstructionNode>,
        blocks: Block[],
        blockIndex: Map<Block, number>,
        firstValidByBlock: Map<Block, Instruction<any> | null>
    ): InstructionNode {
        const first = firstValidByBlock.get(block);
        if (first) {
            return this.getOrCreate(cache, first);
        }

        const startIdx = blockIndex.get(block);
        if (startIdx == null) {
            throw new Error('Block index not found.');
        }
        for (let i = startIdx; i < blocks.length; i++) {
            const inst = firstValidByBlock.get(blocks[i]);
            if (inst) {
                return this.getOrCreate(cache, inst);
            }
        }

        throw new Error('No instructions remaining.');
    }

    private firstValid(instructions: Instruction<any>[]): Instruction<any> | null {
        for (const inst of instructions) {
            if (inst.opcode !== Opcode.LineNumber) {
                return inst;
            }
        }
        return null;
    }

    private getOrCreate(cache: Map<Instruction<any>, InstructionNode>, instruction: Instruction<any>): InstructionNode {
        let node = cache.get(instruction);
        if (!node) {
            node = new InstructionNode(instruction);
            cache.set(instruction, node);
        }
        return node;
    }
}

const TERMINAL_OPCODES = new Set([Opcode.Branch, Opcode.Jump, Opcode.Return]);

const BRANCH_OPCODES = new Set([
    Opcode.Branch,
    Opcode.BranchNot,
    Opcode.BranchEquals,
    Opcode.BranchLessThan,
    Opcode.BranchGreaterThan,
    Opcode.BranchLessThanOrEquals,
    Opcode.BranchGreaterThanOrEquals,
    Opcode.LongBranchNot,
    Opcode.LongBranchEquals,
    Opcode.LongBranchLessThan,
    Opcode.LongBranchGreaterThan,
    Opcode.LongBranchLessThanOrEquals,
    Opcode.LongBranchGreaterThanOrEquals,
    Opcode.ObjBranchNot,
    Opcode.ObjBranchEquals
]);
