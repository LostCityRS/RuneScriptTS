export class ParsingException extends Error {
    public readonly line: number;
    public readonly column: number;

    constructor(message: string | null, cause: Error | null, line: number, column: number) {
        super(message ?? undefined);

        this.name = 'ParsingException';
        this.line = line;
        this.column = column;
    }

    override get message(): string {
        return `line ${this.line}:${this.column}: ${super.message}`;
    }
}
