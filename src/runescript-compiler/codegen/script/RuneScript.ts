
import { ScriptSymbol } from '../../symbol/ScriptSymbol';
import { BasicSymbol, LocalVariableSymbol } from '../../symbol/Symbol';
import { TriggerType } from '../../trigger/TriggerType';
import { Block } from './Block';
import { SwitchTable } from './SwitchTable';

/**
 * A representation of a script containing the blocks of instructions and switch tables.
 */
export class RuneScript {
    /**
     * The trigger of the script.
     */
    public readonly trigger: TriggerType;

    /**
     * The name of the script.
     */
    public readonly name: string;

    /**
     * Combination of `[trigger,name]`.
     */
    public readonly fullName: string;

    /**
     * The table that contains all `LocalVariableSymbol`s defined within the script.
     */
    public readonly locals: LocalTable;

    /**
     * The blocks of instructions that make up the script.
     */
    public readonly blocks: Block[] = [];

    /**
     * The switch tables used within the script.
     */
    public readonly switchTables: SwitchTable[] = [];

    constructor(
        public readonly sourceName: string,
        public readonly symbol: ScriptSymbol,
        public readonly subjectReference?: BasicSymbol
    ) {
        this.trigger = symbol.trigger;
        this.name = symbol.name;
        this.fullName = `[${this.trigger.identifier},${this.name}]`;
        this.locals = new LocalTable();
    }

    /**
     * Generates a new switch table and adds it to the internal list of switch tables.
     */
    public generateSwitchTable(): SwitchTable {
        const newTable = new SwitchTable(this.switchTables.length);
        this.switchTables.push(newTable);
        return newTable;
    }
}

/**
 * Containers all local variables declared in the script.
 */
export class LocalTable {
    /**
     * A list of all parameters.
     */
    public readonly parameters: LocalVariableSymbol[] = [];
    /**
     * A list of all variables. This will include all the variables in [parameters] as well.
     */
    public readonly all: LocalVariableSymbol[] = [];
};