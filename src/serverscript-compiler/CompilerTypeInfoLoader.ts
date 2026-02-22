import { SymbolLoader } from '#/runescript-compiler/configuration/SymbolLoader.js';
import { ScriptCompiler } from '#/runescript-compiler/ScriptCompiler.js';
import { SymbolTable } from '#/runescript-compiler/symbol/SymbolTable.js';
import { MetaType } from '#/runescript-compiler/type/MetaType.js';
import { TupleType } from '#/runescript-compiler/type/TupleType.js';
import { Type } from '#/runescript-compiler/type/Type.js';

import { CompilerTypeInfo } from '#/serverscript-compiler/CompilerTypeInfo.js';
import { SymbolMapper } from '#/serverscript-compiler/SymbolMapper.js';

export class CompilerTypeInfoLoader extends SymbolLoader {
    constructor(
        private readonly mapper: SymbolMapper,
        private readonly symbols: CompilerTypeInfo,
        private readonly typeSupplier: (subType: Type) => Type
    ) {
        super();
    }

    override load(table: SymbolTable, compiler: ScriptCompiler): void {
        for (const [key, name] of Object.entries(this.symbols.map)) {
            const id = parseInt(key);

            let subTypes: Type = MetaType.Unit;
            const vartype = this.symbols.vartype[key];
            if (vartype) {
                subTypes = TupleType.fromList(vartype.split(',').map(typeName => compiler.types.find(typeName) ?? MetaType.Error));
            }

            const type = this.typeSupplier(subTypes);
            const symbol = this.addBasic(table, type, name);

            this.mapper.putSymbol(id, symbol);
        }
    }
}
