import { SymbolLoader } from '#/compiler/configuration/SymbolLoader.js';
import { ScriptCompiler } from '#/compiler/ScriptCompiler.js';

import { SymbolTable } from '#/compiler/symbol/SymbolTable.js';

import { CompilerTypeInfo } from '#/runescript/CompilerTypeInfo.js';

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
