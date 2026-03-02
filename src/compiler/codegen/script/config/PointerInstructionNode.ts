import { InstructionNode } from '#/compiler/codegen/script/config/InstructionNode.js';

import { PointerType } from '#/compiler/pointer/PointerType.js';

export class PointerInstructionNode extends InstructionNode {
    public readonly set: Set<PointerType>;

    constructor(set: Set<PointerType>) {
        super(null);
        this.set = set;
    }
}
