import { RuneScriptSymbol } from '#/runescript-compiler/symbol/Symbol.js';
import { SymbolType } from '#/runescript-compiler/symbol/SymbolType.js';

/**
 * A table that contains [Symbol]s. The table provides helper functions for inserting and looking up symbols.
 *
 * The table may or may not have a [parent]. To create a symbol table with a `parent`, see [createSubTable].
 *
 * See Also: [Symbol table](https://en.wikipedia.org/wiki/Symbol_table)
 * @see createSubTable
 */
export class SymbolTable {
    private symbols: Map<SymbolType<any>, Map<string, RuneScriptSymbol>> = new Map();

    constructor(private parent: SymbolTable | null = null) {}

    private normalizeName(type: SymbolType<any>, name: string): string {
        if (type.kind === 'Basic') {
            return name.toLowerCase().replace(/\s+/g, '_');
        }
        return name;
    }

    /**
     * Inserts [symbol] into the table and indicates if the insertion was successful.
     */
    insert<T extends RuneScriptSymbol>(type: SymbolType<T>, symbol: T): boolean {
        const key = this.normalizeName(type, symbol.name);
        let current: SymbolTable | null = this;

        while (current) {
            const table = current.symbols.get(type);
            if (table?.has(key)) {
                return false;
            }
            current = current.parent;
        }

        let table = this.symbols.get(type);
        if (!table) {
            table = new Map();
            this.symbols.set(type, table);
        }

        table.set(key, symbol);
        return true;
    }

    /**
     * Searches for a symbol with [name] and [type].
     */
    find<T extends RuneScriptSymbol>(type: SymbolType<T>, name: string): T | null {
        const table = this.symbols.get(type);
        const key = this.normalizeName(type, name);
        const symbol = table?.get(key) as T | undefined;

        if (symbol) return symbol;
        return this.parent?.find(type, name) ?? null;
    }

    /**
     * Searches for all symbols with the given name,
     * optionally restricted by kind.
     */
    findAll<T extends RuneScriptSymbol>(name: string, type?: { new (...args: any[]): T }): T[] {
        const results: T[] = [];
        for (const symbol of this.findAllIter(name, type)) {
            results.push(symbol);
        }
        return results;
    }

    /**
     * Iterates all symbols with the given name,
     * optionally restricted by kind.
     */
    *findAllIter<T extends RuneScriptSymbol>(name: string, type?: { new (...args: any[]): T }): IterableIterator<T> {
        for (const [symbolType, table] of this.symbols.entries()) {
            const key = this.normalizeName(symbolType, name);
            const symbol = table.get(key);
            if (symbol && (!type || symbol instanceof type)) {
                yield symbol as T;
            }
        }
        if (this.parent) {
            yield* this.parent.findAllIter(name, type);
        }
    }

    /**
     * Creates a sub-table with this as the parent.
     */
    createSubTable(): SymbolTable {
        return new SymbolTable(this);
    }
}
