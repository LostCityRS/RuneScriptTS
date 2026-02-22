import { DynamicCommandHandler } from '#/runescript-compiler/configuration/command/DynamicCommandHandler.js';
import { TypeCheckingContext } from '#/runescript-compiler/configuration/command/TypeCheckingContext.js';
import { MetaType } from '#/runescript-compiler/type/MetaType.js';
import { PrimitiveType } from '#/runescript-compiler/type/PrimitiveType.js';
import { TupleType } from '#/runescript-compiler/type/TupleType.js';
import { Type } from '#/runescript-compiler/type/Type.js';

export class QueueCommandHandler implements DynamicCommandHandler {
    private readonly queueType: InstanceType<typeof MetaType.Script>;

    constructor(queueType: Type) {
        this.queueType = queueType as InstanceType<typeof MetaType.Script>;
    }

    typeCheck(context: TypeCheckingContext): void {
        context.checkArgument(0, this.queueType); // Script to queue.
        context.checkArgument(1, PrimitiveType.INT); // Delay before running script.
        context.checkArgument(2, PrimitiveType.INT); // Int arg to pass to script.

        // TODO: (Type safety) Make sure queue script only expects up to 1 int arg (parameterType).
        const expectedTypesList: Type[] = [this.queueType, PrimitiveType.INT, PrimitiveType.INT];

        context.checkArgumentTypes(TupleType.fromList(expectedTypesList));
        context.expression.type = MetaType.Unit;
    }
}
