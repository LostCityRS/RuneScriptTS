import type { NodeSourceLocation } from '#/runescript-parser/ast/NodeSourceLocation.js';
import { Node } from '#/runescript-parser/ast/Node.js';
import { AstVisitor } from '#/runescript-parser/ast/AstVisitor.js';

/**
 * A simple node that contains an antlr [org.antlr.v4.runtime.Token] text.
 */
export class Token extends Node {
    public readonly text: string;

    constructor(source: NodeSourceLocation, text: string) {
        super(source);
        this.text = text;
    }

    accept<R>(visitor: AstVisitor<R>): R {
        return visitor.visitToken(this);
    }
}
