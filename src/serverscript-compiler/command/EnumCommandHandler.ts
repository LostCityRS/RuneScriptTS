import { DynamicCommandHandler } from '#/runescript-compiler/configuration/command/DynamicCommandHandler.js';
import { TypeCheckingContext } from '#/runescript-compiler/configuration/command/TypeCheckingContext.js';
import { MetaType } from '#/runescript-compiler/type/MetaType.js';
import { TupleType } from '#/runescript-compiler/type/TupleType.js';

import { ScriptVarType } from '#/serverscript-compiler/type/ScriptVarType.js';

/**
 * An implementation of [DynamicCommandHandler] that adds support for type checking
 * the `enum` command within scripts.
 *
 * Example:
 * ```
 * def_obj $item = enum(int, obj, item_list, $index);
 * ```
 */
export class EnumCommandHandler implements DynamicCommandHandler {
    typeCheck(context: TypeCheckingContext): void {
        // Fetch the arguments (minus last).
        const inputTypeExpression = context.checkTypeArgument(0);
        const outputTypeExpression = context.checkTypeArgument(1);
        context.checkArgument(2, ScriptVarType.ENUM);

        // Fetch the evaluation of the input and output types.
        const inputType = inputTypeExpression?.type instanceof MetaType.Type ? inputTypeExpression.type.inner : undefined;
        const outputType = outputTypeExpression?.type instanceof MetaType.Type ? outputTypeExpression.type.inner : undefined;

        // Type hint the last argument with the inputtype inner type.
        context.checkArgument(3, inputType);

        // Create the expected type of 'type,type,enum,any'.
        const expectedTypes = new TupleType(new MetaType.Type(inputType ?? MetaType.Any), new MetaType.Type(outputType ?? MetaType.Any), ScriptVarType.ENUM, inputType ?? MetaType.Any);

        // Compare the expected types with the actual types.
        context.checkArgumentTypes(expectedTypes);

        // Set the command type to the specified output type.
        context.expression.type = outputType ?? MetaType.Error;
    }
}
