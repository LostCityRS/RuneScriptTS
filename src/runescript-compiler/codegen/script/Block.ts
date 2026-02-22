import { Instruction } from '#/runescript-compiler/codegen/Instruction.js';
import { Label } from '#/runescript-compiler/codegen/script/Label.js';

/**
 * Represents a block of instructions.
 */
export class Block {
    /**
     * The list of all [Instruction]s within the block.
     */
    public readonly instructions: Instruction<any>[] = [];

    constructor(public readonly label: Label) {}

    /**
     * Adds [instruction] to this block.
     */
    public add(instruction: Instruction<any>): void {
        this.instructions.push(instruction);
    }

    /**
     * Shortcut to [add].
     */
    public plusAssign(instruction: Instruction<any>): void {
        this.add(instruction);
    }
}
