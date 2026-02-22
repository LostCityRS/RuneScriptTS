import { SymbolLoader } from '#/runescript-compiler/configuration/SymbolLoader.js';
import { ScriptCompiler } from '#/runescript-compiler/ScriptCompiler.js';
import { SymbolTable } from '#/runescript-compiler/symbol/SymbolTable.js';

import { CompilerTypeInfo } from '#/serverscript-compiler/CompilerTypeInfo.js';

export class CompilerTypeInfoConstantLoader extends SymbolLoader {
    constructor(private readonly symbols: CompilerTypeInfo) {
        super();
    }

    override load(table: SymbolTable, compiler: ScriptCompiler): void {
        for (const [key, value] of Object.entries(this.symbols.map)) {
            this.addConstant(table, key, value);
        }
    }
}
