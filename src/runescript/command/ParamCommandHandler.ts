import { DynamicCommandHandler } from '#/compiler/configuration/command/DynamicCommandHandler.js';
import { TypeCheckingContext } from '#/compiler/configuration/command/TypeCheckingContext.js';

import { MetaType } from '#/compiler/type/MetaType.js';
import { TupleType } from '#/compiler/type/TupleType.js';
import { Type } from '#/compiler/type/Type.js';

import { ParamType } from '#/runescript/type/ParamType.js';

export class ParamCommandHandler implements DynamicCommandHandler {
    private readonly type: Type | null;

    constructor(type: Type | null) {
        this.type = type;
    }

    typeCheck(context: TypeCheckingContext): void {
        const expectedTypes: Type[] = [];

        if (this.type !== null) {
            expectedTypes.push(this.type);
            context.checkArgument(0, this.type);
        }

        // Check the second argument is a param reference.
        const paramIndex = this.type === null ? 0 : 1;
        const paramExpression = context.checkArgument(paramIndex, ParamCommandHandler.PARAM_ANY);

        const paramReturnType = paramExpression?.type instanceof ParamType ? paramExpression.type.inner : undefined;

        // Add param type to expected types.
        expectedTypes.push(new ParamType(paramReturnType ?? MetaType.Any));

        // Compare expected vs actual argument types.
        if (!context.checkArgumentTypes(TupleType.fromList(expectedTypes))) {
            context.expression.type = MetaType.Error;
            return;
        }

        // Verify the param type was resolved.
        if (paramReturnType == null) {
            context.expression.reportError(context.diagnostics, 'Param return type was not able to be found.');
            context.expression.type = MetaType.Error;
            return;
        }

        context.expression.type = paramReturnType;
    }

    private static readonly PARAM_ANY = new ParamType(MetaType.Any);
}
