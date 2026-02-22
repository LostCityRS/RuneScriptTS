import { Instruction } from '#/runescript-compiler/codegen/Instruction.js';

/**
 * Represents a node in the control flow graph containing a single instruction.
 */
export class InstructionNode {
    public readonly instruction?: Instruction<any>;
    public readonly next: InstructionNode[] = [];
    public readonly previous: InstructionNode[] = [];

    constructor(instruction?: Instruction<any>) {
        this.instruction = instruction;
    }

    public addNext(node: InstructionNode): void {
        this.next.push(node);
        node.previous.push(this);
    }

    public toString(): string {
        return `InstructionNode(instruction=${this.instruction})`;
    }
}
