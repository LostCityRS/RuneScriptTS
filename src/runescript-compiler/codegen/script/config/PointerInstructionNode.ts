import { PointerType } from '../../../pointer/PointerType';
import { InstructionNode } from './InstructionNode';

export class PointerInstructionNode extends InstructionNode {
    public readonly set: Set<PointerType>;

    constructor(set: Set<PointerType>) {
        super(null);
        this.set = set;
    }
}