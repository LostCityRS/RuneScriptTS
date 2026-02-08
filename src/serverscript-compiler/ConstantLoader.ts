import { readFileSync } from 'fs';
import { SymbolLoader } from '../runescript-compiler/configuration/SymbolLoader';
import { ScriptCompiler } from '../runescript-compiler/ScriptCompiler';
import { SymbolTable } from '../runescript-compiler/symbol/SymbolTable';

export class ConstantLoader extends SymbolLoader {
    constructor(private readonly path: string) {
        super();
    }

    override load(table: SymbolTable, compiler: ScriptCompiler): void {
        const contents = readFileSync(this.path, 'utf8');
    
        for (const line of contents.split(/\r?\n/)) {
            const split = line.split('\t', 2);
            if (split.length !== 2) continue;
            console.log(split[0]);
            console.log(split[1]);

            this.addConstant(table, split[0], split[1]);
        }
    }
}