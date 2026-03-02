import { Opcode } from '#/compiler/codegen/Opcode.js';

import { CodeGeneratorContext } from '#/compiler/configuration/command/CodeGeneratorContext.js';
import { DynamicCommandHandler } from '#/compiler/configuration/command/DynamicCommandHandler.js';
import { TypeCheckingContext } from '#/compiler/configuration/command/TypeCheckingContext.js';

import { MetaType } from '#/compiler/type/MetaType.js';
import { PrimitiveType } from '#/compiler/type/PrimitiveType.js';

import { Script } from '#/parser/ast/Scripts.js';

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
