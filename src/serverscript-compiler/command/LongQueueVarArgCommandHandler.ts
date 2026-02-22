import { Opcode } from '#/runescript-compiler/codegen/Opcode.js';
import { CodeGeneratorContext } from '#/runescript-compiler/configuration/command/CodeGeneratorContext.js';
import { DynamicCommandHandler } from '#/runescript-compiler/configuration/command/DynamicCommandHandler.js';
import { TypeCheckingContext } from '#/runescript-compiler/configuration/command/TypeCheckingContext.js';
import { MetaType } from '#/runescript-compiler/type/MetaType.js';
import { PrimitiveType } from '#/runescript-compiler/type/PrimitiveType.js';
import { TupleType } from '#/runescript-compiler/type/TupleType.js';
import { Type } from '#/runescript-compiler/type/Type.js';

export class LongQueueVarArgCommandHandler implements DynamicCommandHandler {
    private readonly queueType: InstanceType<typeof MetaType.Script>;

    constructor(queueType: Type) {
        this.queueType = queueType as InstanceType<typeof MetaType.Script>;
    }

    typeCheck(context: TypeCheckingContext): void {
        const queue = context.checkArgument(0, this.queueType); // Script to queue.
        context.checkArgument(1, PrimitiveType.INT); // Delay before running script.
        context.checkArgument(2, PrimitiveType.INT); // Action to perform if logout succeeds mid-queue.

        const baseTypeList: Type[] = [this.queueType, PrimitiveType.INT, PrimitiveType.INT];
        const varArgTypesList: Type[] = [];

        const queueExpressionType = queue?.type;
        if (queueExpressionType instanceof MetaType.Script && queueExpressionType.trigger == this.queueType.trigger && queueExpressionType.parameterType != MetaType.Unit) {
            varArgTypesList.push(...TupleType.toList(queueExpressionType.parameterType));
        }

        context.checkArgumentTypes(TupleType.fromList(baseTypeList), true, false);
        context.checkArgumentTypes(TupleType.fromList(varArgTypesList), true, true);
        context.expression.type = MetaType.Unit;
    }

    generateCode(context: CodeGeneratorContext): void {
        const args = context.arguments;
        context.visitNodes(args);

        const args2 = context.arguments2;
        context.visitNodes(args2);

        if (args2.length > 0) {
            const shortTypes = args2
                .map(arg => arg.type.code)
                .filter((code): code is string => code != null)
                .join('');
            context.instruction(Opcode.PushConstantString, shortTypes);
        } else {
            context.instruction(Opcode.PushConstantString, '');
        }

        context.command();
    }
}
