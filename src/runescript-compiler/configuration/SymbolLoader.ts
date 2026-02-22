import { ScriptCompiler } from '#/runescript-compiler/ScriptCompiler.js';
import { BasicSymbol, ConstantSymbol } from '#/runescript-compiler/symbol/Symbol.js';
import { SymbolTable } from '#/runescript-compiler/symbol/SymbolTable.js';
import { SymbolType } from '#/runescript-compiler/symbol/SymbolType.js';
import { Type } from '#/runescript-compiler/type/Type.js';

/**
 * A loader that gets ran before any compilation process happens with the compiler. This
 * allows custom implementations of external symbol loading. This interface defines helper
 * extension functions for adding specific types of symbols to a [SymbolTable].
 */
export abstract class SymbolLoader {
    /**
     * Called when the compiler is ready to load external symbols.
     *
     * Types may be looked up via [ScriptCompiler.types] if needed.
     */
    abstract load(table: SymbolTable, compiler: ScriptCompiler): void;

    /**
     * Adds a [ConstantSymbol] to the table with the given [name] and [value].
     *
     * Returns [ConstantSymbol] that was inserted.
     */
    addConstant(symbolTable: SymbolTable, name: string, value: string): ConstantSymbol {
        const symbol = new ConstantSymbol(name, value);
        if (!symbolTable.insert(SymbolType.constant(), symbol)) {
            throw new Error(`Unable to add constant: name=${name}, value=${value}.`);
        }

        return symbol;
    }

    /**
     * Adds a [BasicSymbol] to the table with the given [type] and [name]. This
     * should be used for any non-config symbols that don't have any special properties
     * to them.
     *
     * Returns the [BasicSymbol] that was inserted.
     */
    addBasic(symbolTable: SymbolTable, type: Type, name: string, isProtected: boolean = false): BasicSymbol {
        const symbol: BasicSymbol = new BasicSymbol(name, type, isProtected);

        if (!symbolTable.insert(SymbolType.basic(type), symbol)) {
            throw new Error(`Unable to add basic: type=${type}, name=${name}`);
        }

        //console.debug(`Added basic: type=${type.baseType}, name=${name}`);

        return symbol;
    }
}
