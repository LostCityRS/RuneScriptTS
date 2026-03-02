import { Opcode } from '#/compiler/codegen/Opcode.js';

import { CodeGeneratorContext } from '#/compiler/configuration/command/CodeGeneratorContext.js';
import { DynamicCommandHandler } from '#/compiler/configuration/command/DynamicCommandHandler.js';
import { TypeCheckingContext } from '#/compiler/configuration/command/TypeCheckingContext.js';

import { SymbolType } from '#/compiler/symbol/SymbolType.js';

import { CommandTrigger } from '#/compiler/trigger/CommandTrigger.js';

import { BaseVarType } from '#/compiler/type/BaseVarType.js';
import { MetaType } from '#/compiler/type/MetaType.js';
import { PrimitiveType } from '#/compiler/type/PrimitiveType.js';
import { TupleType } from '#/compiler/type/TupleType.js';
import { Type } from '#/compiler/type/Type.js';

import { ExpressionGenerator } from '#/runescript/util/ExpressionGenerator.js';

/**
 * Developer "command" used to easily debug any expression.
 *
 * Converts `dump(expr1, ...)` into the string `"expr1=<expr1>, ..."`, converting types where needed.
 */
export class DumpCommandHandler implements DynamicCommandHandler {
    typeCheck(context: TypeCheckingContext): void {
        if (context.arguments.length === 0) {
            context.expression.reportError(context.diagnostics, DumpCommandHandler.DIAGNOSTIC_INVALID_SIGNATURE);
        } else {
            context.arguments.forEach((arg, i) => {
                context.checkArgument(i, MetaType.Any);

                const type = arg.type;
                if (type instanceof TupleType) {
                    arg.reportError(context.diagnostics, DumpCommandHandler.DIAGNOSTIC_TUPLE_TYPE, type.representation);
                } else if (type.baseType !== BaseVarType.INTEGER && type.baseType !== BaseVarType.STRING) {
                    arg.reportError(context.diagnostics, DumpCommandHandler.DIAGNOSTIC_UNIT_TYPE, type.representation);
                }
            });
        }

        context.expression.type = PrimitiveType.STRING;
    }

    generateCode(context: CodeGeneratorContext): void {
        context.lineInstruction(context.expression);

        let parts = 0;

        context.arguments.forEach((arg, i) => {
            const argString = arg.accept(DumpCommandHandler.EXPRESSION_GENERATOR);

            // Put the expression string
            context.instruction(Opcode.PushConstantString, `${argString}=`);
            parts++;

            // Evaluate the expression.
            context.visitNode(arg);

            // Convert the expression to string, if necessary.
            this.typeToString(context, arg.type);

            // Separate each argument with a comma.
            if (i !== context.arguments.length - 1) {
                context.instruction(Opcode.PushConstantString, ', ');
                parts++;
            }
        });

        context.instruction(Opcode.JoinString, parts);
    }

    private typeToString(context: CodeGeneratorContext, type: Type): void {
        let conversionCommandName: string;

        if (type === PrimitiveType.STRING) {
            conversionCommandName = 'escape';
        } else if (type.baseType === BaseVarType.INTEGER) {
            conversionCommandName = 'toString';
        } else {
            throw new Error(`Unsupported type conversion to string: ${type}`);
        }

        const conversionSymbol = context.rootTable.find(SymbolType.serverScript(CommandTrigger), conversionCommandName);

        if (conversionSymbol) {
            context.instruction(Opcode.Command, conversionSymbol);
        }
    }

    private static readonly DIAGNOSTIC_INVALID_SIGNATURE = "Type mismatch: '<unit>' was given but 'any...' was expected.";

    private static readonly DIAGNOSTIC_TUPLE_TYPE = 'Unable to dump multi-value types: %s';

    private static readonly DIAGNOSTIC_INVALID_BASE_TYPE = "Unable to debug '%s' expressions.";

    private static readonly DIAGNOSTIC_UNIT_TYPE = 'Unable to debug expression with no return value.';

    private static readonly EXPRESSION_GENERATOR = new ExpressionGenerator();
}
