import type { NodeSourceLocation } from '#/runescript-parser/ast/NodeSourceLocation.js';
import { Node } from '#/runescript-parser/ast/Node.js';
import { DiagnosticType } from '#/runescript-compiler/diagnostics/DiagnosticType.js';

// TODO: Further documentation.
export class Diagnostic {
    public readonly type: DiagnosticType;
    public readonly sourceLocation: NodeSourceLocation;
    public readonly message: string;
    public readonly messageArgs: any[];

    /**
     * [Node] based constructor
     */
    constructor(type: DiagnosticType, sourceLocation: Node, message: string, ...messageArgs: any[]);

    /**
     * [NodeSourceLocation] based constructor
     */
    constructor(type: DiagnosticType, sourceLocation: NodeSourceLocation, message: string, ...messageArgs: any[]);

    constructor(type: DiagnosticType, nodeOrSource: Node | NodeSourceLocation, message: string, ...messageArgs: any[]) {
        this.type = type;

        if ('source' in nodeOrSource) {
            this.sourceLocation = nodeOrSource.source;
        } else {
            this.sourceLocation = nodeOrSource;
        }

        this.messageArgs = messageArgs;
        this.message = message;
    }

    public isError(): boolean {
        return this.type === DiagnosticType.ERROR || this.type === DiagnosticType.SYNTAX_ERROR;
    }
}

function isNode(obj: any): obj is Node {
    return obj instanceof Node;
}
