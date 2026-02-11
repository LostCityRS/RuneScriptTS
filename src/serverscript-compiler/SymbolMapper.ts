import { ScriptSymbol } from "../runescript-compiler/symbol/ScriptSymbol";
import { RuneScriptSymbol } from "../runescript-compiler/symbol/Symbol";
import { CommandTrigger } from "../runescript-compiler/trigger/CommandTrigger";
import { IdProvider } from "../runescript-compiler/writer/BaseScriptWriter";

/**
 * A [BaseScriptWriter.IdProvider] that allows looking up an id by [Symbol].
 *
 * This implementation has a map for [ScriptSymbol]s and one for all other symbols.
 * The script symbol stores the key as the full name of the script instead of the
 * symbol itself.
 */

export class SymbolMapper implements IdProvider {
    /**
     * A special mapping for scripts since command symbols are created in the compiler.
     */
    private readonly commands = new Map<string, number>();

    /**
     * A special mapping for scripts since script symbols are created in the compiler.
     */
    private readonly scripts = new Map<string, number>();

    /**
     * A map of each symbol to their id.
     */
    private readonly symbols = new Map<RuneScriptSymbol, number>();

    putSymbol(id: number, symbol: RuneScriptSymbol): void {
        if (this.symbols.has(symbol)) {
            throw new Error(`Duplicate symbol: ${symbol}.`);
        }
        this.symbols.set(symbol, id);
    }

    putCommand(id: number, name: string): void {
        if (this.commands.has(name)) {
            throw new Error(`Duplicate command: ${name}.`);
        }
        this.commands.set(name, id);
    }

    putScript(id: number, name: string): void {
        if (this.scripts.has(name)) {
            throw new Error(`Duplicate script: ${name}.`);
        }
        this.scripts.set(name, id);
    }

    get(symbol: RuneScriptSymbol): number {
        if (symbol instanceof ScriptSymbol) {
            if (symbol.trigger === CommandTrigger) {
                // Trim off dot commands.
                const name = symbol.name.substring(symbol.name.indexOf('.') + 1);
                const id = this.commands.get(name);
                if (id === undefined) {
                    throw new Error(`Unable to find id for '${symbol}'.`);
                }
                return id;
            } else {
                const name = `[${symbol.trigger.identifier},${symbol.name}]`;
                const id = this.scripts.get(name);
                if (id === undefined) {
                    throw new Error(`Unable to find id for '${symbol}'.`);
                }
                return id;
            }
        }

        const id = this.symbols.get(symbol);
        if (id === undefined) {
            throw new Error(`Unable to find id for '${symbol}'.`);
        }
        return id;
    }
}