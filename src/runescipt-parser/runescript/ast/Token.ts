import { JavaObjects } from '../util/JavaObjects';
import { ToStringHelper } from '../util/ToStringHelper';
import { NodeSourceLocation } from './NodeSourceLocation';
import { Node } from './Node';
import { AstVisitor } from './AstVisitor';
import { Hashable } from '../util/Hashable';

/**
 * A simple node that contains an antlr [org.antlr.v4.runtime.Token] text.
 */
export class Token extends Node implements Hashable {
    public readonly text: string;

    constructor(source: NodeSourceLocation, text: string) {
        super(source);
        this.text = text;
    }

    accept<R>(visitor: AstVisitor<R>): R {
        return visitor.visitToken(this);
    }

    hashCode(): number {
        return JavaObjects.hash(this.text);
    }

    equals(other: unknown): boolean {
        if (this === other) return true;
        if (!(other instanceof Token)) return false;

        return JavaObjects.equals(this.text, other.text);
    }

    toString(): string {
        return new ToStringHelper(this)
            .add("text", this.text)
            .toString();
    }
}