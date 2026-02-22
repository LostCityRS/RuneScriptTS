import { Script } from '#/runescript-parser/ast/Scripts.js';
import { Opcode } from '#/runescript-compiler/codegen/Opcode.js';
import { CodeGeneratorContext } from '#/runescript-compiler/configuration/command/CodeGeneratorContext.js';
import { DynamicCommandHandler } from '#/runescript-compiler/configuration/command/DynamicCommandHandler.js';
import { TypeCheckingContext } from '#/runescript-compiler/configuration/command/TypeCheckingContext.js';
import { MetaType } from '#/runescript-compiler/type/MetaType.js';
import { PrimitiveType } from '#/runescript-compiler/type/PrimitiveType.js';

/**
 * Dynamic command handler that replaces the call with a string constant containing
 * the name of the script it is called in.
 */
export class ScriptCommandHandler implements DynamicCommandHandler {
    typeCheck(context: TypeCheckingContext): void {
        context.checkArgumentTypes(MetaType.Unit);
        context.expression.type = PrimitiveType.STRING;
    }

    generateCode(context: CodeGeneratorContext): void {
        const script = context.expression.findParentByType(Script);
        if (!script) {
            throw new Error(`Script not found.`);
        }

        const name = `[${script.trigger.text}, ${script.name.text}]`;
        context.lineInstruction(context.expression);
        context.instruction(Opcode.PushConstantString, name);
    }
}
