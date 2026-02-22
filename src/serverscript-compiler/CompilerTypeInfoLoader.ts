import { SymbolLoader } from "../runescript-compiler/configuration/SymbolLoader";
import { ScriptCompiler } from "../runescript-compiler/ScriptCompiler";
import { SymbolTable } from "../runescript-compiler/symbol/SymbolTable";
import { MetaType } from "../runescript-compiler/type/MetaType";
import { TupleType } from "../runescript-compiler/type/TupleType";
import { Type } from "../runescript-compiler/type/Type";
import { CompilerTypeInfo } from "./CompilerTypeInfo.js";
import { SymbolMapper } from "./SymbolMapper";

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