import { Label } from '#/runescript-compiler/codegen/script/Label.js';

/**
 * A switch case that can contain multiple keys that point to a single label.
 */
export class SwitchCase {
    constructor(
        public readonly label: Label,
        public readonly keys: any[]
    ) {}
}

/**
 * A table of [SwitchCase]s.
 */
export class SwitchTable {
    /**
     * The list of cases withing the switch table.
     */
    private _cases: SwitchCase[] = [];

    constructor(public readonly id: number) {}

    /**
     * An immutable list of cases within the switch table.
     */
    public get cases(): ReadonlyArray<SwitchCase> {
        return this._cases;
    }

    /**
     * Adds the [case] to the switch table.
     */
    public addCase(switchCase: SwitchCase): void {
        this._cases.push(switchCase);
    }
}
