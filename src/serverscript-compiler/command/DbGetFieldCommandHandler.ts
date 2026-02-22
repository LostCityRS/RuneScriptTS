import { DynamicCommandHandler } from '#/runescript-compiler/configuration/command/DynamicCommandHandler.js';
import { TypeCheckingContext } from '#/runescript-compiler/configuration/command/TypeCheckingContext.js';
import { MetaType } from '#/runescript-compiler/type/MetaType.js';
import { PrimitiveType } from '#/runescript-compiler/type/PrimitiveType.js';
import { TupleType } from '#/runescript-compiler/type/TupleType.js';

import { DbColumnType } from '#/serverscript-compiler/type/DbColumnType.js';
import { ScriptVarType } from '#/serverscript-compiler/type/ScriptVarType.js';

/**
 * Handles the `db_getfield` command that returns a dynamic type
 * based on the column that was passed in.
 *
 * Example:
 * ```
 * $int, $obj, $string = db_getfield(some_row, table:column, 0);
 * ```
 */
export class DbGetFieldCommandHandler implements DynamicCommandHandler {
    typeCheck(context: TypeCheckingContext): void {
        // Check first argument as dbrow.
        context.checkArgument(0, ScriptVarType.DBROW);

        // Check column as dbcolumn.
        const columnExpr = context.checkArgument(1, new DbColumnType(MetaType.Any));

        // Check field id as int.
        context.checkArgument(2, PrimitiveType.INT);

        // Typehint the second argument using the dbcolumn type if it was valid.
        const columntReturnType = (columnExpr?.type as DbColumnType)?.inner;

        // Define the expected types based on what is currently known.
        const expectedTypes = new TupleType(ScriptVarType.DBROW, new DbColumnType(columntReturnType ?? MetaType.Any), PrimitiveType.INT);

        // Compare the expected types with the actual types.
        if (!context.checkArgumentTypes(expectedTypes)) {
            context.expression.type = MetaType.Error;
            return;
        }

        // Verify the [columnExpr] type is valid.
        if (columnExpr == null) {
            const reportExpr = columnExpr ?? context.expression;
            reportExpr.reportError(context.diagnostics, `Unable to extract type from argument.`);
            context.expression.type = MetaType.Error;
            return;
        }

        // Set the return type.
        context.expression.type = columntReturnType;
    }
}
