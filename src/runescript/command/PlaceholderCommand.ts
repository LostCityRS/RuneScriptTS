import { Opcode } from '#/compiler/codegen/Opcode.js';

import { CodeGeneratorContext } from '#/compiler/configuration/command/CodeGeneratorContext.js';
import { DynamicCommandHandler } from '#/compiler/configuration/command/DynamicCommandHandler.js';
import { TypeCheckingContext } from '#/compiler/configuration/command/TypeCheckingContext.js';

import { MetaType } from '#/compiler/type/MetaType.js';
import { Type } from '#/compiler/type/Type.js';

export class PlaceholderCommand implements DynamicCommandHandler {
    constructor(
        private readonly type: Type,
        private readonly value: unknown
    ) {}

    typeCheck(context: TypeCheckingContext): void {
        context.checkArgumentTypes(MetaType.Unit);
        context.expression.type = this.type;
    }

    generateCode?(context: CodeGeneratorContext): void {
        context.lineInstruction(context.expression);

        if (typeof this.value === 'number') {
            context.instruction(Opcode.PushConstantInt, this.value);
        } else if (typeof this.value === 'string') {
            context.instruction(Opcode.PushConstantString, this.value);
        } else {
            throw new Error(`Unsupported value: ${this.value}`);
        }
    }
}
