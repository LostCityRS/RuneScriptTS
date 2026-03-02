import { AstVisitor } from '#/parser/ast/AstVisitor.js';
import { Node } from '#/parser/ast/Node.js';
import type { NodeSourceLocation } from '#/parser/ast/NodeSourceLocation.js';

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
