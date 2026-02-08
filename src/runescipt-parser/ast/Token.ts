
import type { NodeSourceLocation } from './NodeSourceLocation';
import { Node } from './Node';
import { AstVisitor } from './AstVisitor';

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