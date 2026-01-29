import { NodeSourceLocation } from '../../runescipt-parser/ast/NodeSourceLocation';
import { DiagnosticType } from './DiagnosticType';

// TODO: Further documentation.
export class Diagnostic {
    public readonly type: DiagnosticType;
    public readonly sourceLocation: NodeSourceLocation;
    public readonly message: string;
    public readonly messageArgs: any[];

    constructor(
        type: DiagnosticType,
        sourceLocation: NodeSourceLocation,
        message: string,
        messageArgs: any[]
    ) {
        this.type = type;
        this.sourceLocation = sourceLocation;
        this.messageArgs = messageArgs;
        this.message = message;
    }

    public isError(): boolean {
        return this.type === DiagnosticType.ERROR || this.type === DiagnosticType.SYNTAX_ERROR;
    }
}