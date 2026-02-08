import { RuneScriptSymbol } from './Symbol';
import { SymbolType } from './SymbolType';

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

    /**
     * Inserts [symbol] into the table and indicates if the insertion was successful.
     */
    insert<T extends RuneScriptSymbol>(type: SymbolType<T>, symbol: T): boolean {
      let current: SymbolTable | null = this;

      while (current) {
          const table = current.symbols.get(type);
          if (table?.has(symbol.name)) {
              return false;
          }
          current = current.parent;
      }

      let table = this.symbols.get(type);
      if (!table) {
          table = new Map();
          this.symbols.set(type, table);
      }

      table.set(symbol.name, symbol);
      return true;
  }

    /**
     * Searches for a symbol with [name] and [type].
     */
  find<T extends RuneScriptSymbol>(type: SymbolType<T>, name: string): T | null {
      
      console.log(this.symbols.has(type.kind));
      console.log(`Find call, type: ${type.kind}, name: ${name}.`);
      console.log(`Symbols size: ${this.symbols.size}`);
      const table = this.symbols.get(type);
      console.debug(`table fetch: ${table}`);
      const symbol = table?.get(name) as T | undefined;
  
      if (symbol) return symbol;
      return this.parent?.find(type, name) ?? null;
  }

    /**
     * Searches for all symbols with the given name,
     * optionally restricted by kind.
     */
    findAll<T extends RuneScriptSymbol>(name: string, type?: { new (...args: any[]): T }): T[] {
        const results: T[] = [];
        for (const table of this.symbols.values()) {
          const symbol = table.get(name);
          if (symbol && (!type || symbol instanceof type)) {
            results.push(symbol as T);
          }
        }
        if (this.parent) {
          results.push(...this.parent.findAll(name, type));
        }
      return results;
    }

    /**
     * Creates a sub-table with this as the parent.
     */
    createSubTable(): SymbolTable {
        return new SymbolTable(this);
    }
} 