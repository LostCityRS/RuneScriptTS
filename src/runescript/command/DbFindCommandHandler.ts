import { Opcode } from '#/compiler/codegen/Opcode.js';

import { CodeGeneratorContext } from '#/compiler/configuration/command/CodeGeneratorContext.js';
import { DynamicCommandHandler } from '#/compiler/configuration/command/DynamicCommandHandler.js';
import { TypeCheckingContext } from '#/compiler/configuration/command/TypeCheckingContext.js';

import { BaseVarType } from '#/compiler/type/BaseVarType.js';
import { MetaType } from '#/compiler/type/MetaType.js';
import { PrimitiveType } from '#/compiler/type/PrimitiveType.js';
import { TupleType } from '#/compiler/type/TupleType.js';

import { DbColumnType } from '#/runescript/type/DbColumnType.js';

export class DbFindCommandHandler implements DynamicCommandHandler {
    private readonly withCount: boolean;

    constructor(withCount: boolean) {
        this.withCount = withCount;
    }

    typeCheck(context: TypeCheckingContext): void {
        // Lookup the column expression.
        const columnExpr = context.checkArgument(0, new DbColumnType(MetaType.Any));

        // Typehint the second argument using the dbcolumn type if it was valid.
        const keyType = (columnExpr?.type as DbColumnType)?.inner;
        context.checkArgument(1, keyType);

        // Define the expected types based on what is currently known.
        const expectedTypes = new TupleType(new DbColumnType(keyType ?? MetaType.Any), keyType ?? MetaType.Any);

        // Check that the key type is not a Tuple type.
        if (keyType instanceof TupleType) {
            columnExpr.reportError(context.diagnostics, `Tuple columns are not supported.`);
        } else {
            // Compare the expected types with the actual types.
            context.checkArgumentTypes(expectedTypes);
        }

        // Set the return type
        context.expression.type = this.withCount ? PrimitiveType.INT : MetaType.Unit;
    }

    generateCode(context: CodeGeneratorContext): void {
        // Should not get to this point unless first argument is a dbcolumn.
        const columnType = (context.arguments[0].type as DbColumnType).inner;

        const stackType = columnType.baseType;
        if (stackType == null) {
            throw new Error('No base type for db_find column');
        }

        // Emit the arguments.
        context.visitNodes(context.arguments);

        // Emit the stack type to pop the key value from.
        context.instruction(Opcode.PushConstantInt, stackType);

        // Emit the command.
        context.command();
    }
}
