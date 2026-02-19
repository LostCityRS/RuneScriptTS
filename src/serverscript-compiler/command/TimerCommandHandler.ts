import { Opcode } from "../../runescript-compiler/codegen/Opcode";
import { CodeGeneratorContext } from "../../runescript-compiler/configuration/command/CodeGeneratorContext";
import { DynamicCommandHandler } from "../../runescript-compiler/configuration/command/DynamicCommandHandler";
import { TypeCheckingContext } from "../../runescript-compiler/configuration/command/TypeCheckingContext";
import { MetaType } from "../../runescript-compiler/type/MetaType";
import { PrimitiveType } from "../../runescript-compiler/type/PrimitiveType";
import { TupleType } from "../../runescript-compiler/type/TupleType";
import { Type } from "../../runescript-compiler/type/Type";

export class TimerCommandHandler implements DynamicCommandHandler {
    private readonly timerType: InstanceType<typeof MetaType.Script>;
        
    constructor(queueType: Type) {
        this.timerType = queueType as InstanceType<typeof MetaType.Script>;
    }

    typeCheck(context: TypeCheckingContext): void {
        const timer = context.checkArgument(0, this.timerType);
        context.checkArgument(1, PrimitiveType.INT); // Interval

        const timerExpressionType = timer?.type;
        const expectedTypesList: Type[] = [
            this.timerType,
            PrimitiveType.INT,
        ];

        if (
            timerExpressionType instanceof MetaType.Script &&
            timerExpressionType.trigger == this.timerType.trigger &&
            timerExpressionType.parameterType != MetaType.Unit
        ) {
            expectedTypesList.push(
                ...TupleType.toList(timerExpressionType.parameterType)
            )
        }

        context.checkArgumentTypes(TupleType.fromList(expectedTypesList));
        context.expression.type = MetaType.Unit;
    }

    generateCode(context: CodeGeneratorContext): void {
        const args = context.arguments;

        // Visit all arguments.
        context.visitNodes(args);

        /**
         * If there are more than 2 arguments that means the queue expects additional parameters,
         * so we must build a string of the argument types to push.
         */
        if (args.length > 2) {
            const shortTypes = args.slice(2).map(arg => arg.type.code).filter((code): code is string => code != null).join("");
            context.instruction(Opcode.PushConstantString, shortTypes);
        } else {
            context.instruction(Opcode.PushConstantString, "");
        }

        context.command();
    }
}