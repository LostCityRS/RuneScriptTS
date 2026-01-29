import { SymbolTable } from '../symbol/SymbolTable';

export interface SymbolLoader {
    /**
     * Called when the compiler is ready to load external symbols.
     *
     * Types may be looked up via [ScriptCompiler.types] if needed.
     */
    load(table: SymbolTable, compiler: ScriptCompiler): void;
}