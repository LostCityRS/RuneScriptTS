import { SymbolLoader } from '../runescript-compiler/configuration/SymbolLoader';
import { ScriptCompiler } from '../runescript-compiler/ScriptCompiler';
import { SymbolTable } from '../runescript-compiler/symbol/SymbolTable';
import { CompilerTypeInfo } from './CompilerTypeInfo.js';

export class CompilerTypeInfoConstantLoader extends SymbolLoader {
    constructor(
        private readonly symbols: CompilerTypeInfo
    ) {
        super();
    }

    override load(table: SymbolTable, compiler: ScriptCompiler): void {
        for (const [key, value] of Object.entries(this.symbols.map)) {
            this.addConstant(table, key, value);
        }
    }
}