import { PointerType } from '#/runescript-compiler/pointer/PointerType.js';
import { InstructionNode } from '#/runescript-compiler/codegen/script/config/InstructionNode.js';

export class PointerInstructionNode extends InstructionNode {
    public readonly set: Set<PointerType>;

    constructor(set: Set<PointerType>) {
        super(null);
        this.set = set;
    }
}
