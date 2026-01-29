import { Hashable } from '../../../util/Hashable';
import { JavaObjects } from '../../../util/JavaObjects';
import { ToStringHelper } from '../../../util/ToStringHelper';
import { AstVisitor } from '../AstVisitor';
import { Node } from '../Node';
import { NodeSourceLocation } from '../NodeSourceLocation';
import { Expression } from './Expression';

/**
 * Represents a piece of a [JoinedStringExpression]
 */
export abstract class StringPart extends Node {
    constructor(source: NodeSourceLocation) {
        super(source);
    }

    accept<R>(visitor: AstVisitor<R>): R {
        return visitor.visitJoinedStringPart(this);
    }
}

/**
 * A basic part that contains only text.
 */
export class BasicStringPart extends StringPart implements Hashable {
    public readonly value: string;

    constructor(source: NodeSourceLocation, value: string) {
        super(source);
        this.value = value;
    }

    public hashCode(): number {
        return JavaObjects.hash(this.value);
    }

    public equals(other: unknown): boolean {
        if (this === other) return true;
        if (!(other instanceof BasicStringPart)) return false;

        return JavaObjects.equals(this.value, other.value);
    }

    public toString(): string {
        return new ToStringHelper(this)
            .add("Text", this.value)
            .toString();
    }
}

/**
 * A basic part that contains a `<p,name>` tag.
 */
export class PTagStringPart extends BasicStringPart {
    constructor(source: NodeSourceLocation, text: string) {
    super(source, text);
  }
}

/**
 * A part that contains an [Expression] that will be executed.
 */
export class ExpressionStringPart extends StringPart implements Hashable {
    public readonly expression: Expression;

    constructor(source: NodeSourceLocation, expression: Expression) {
        super(source);
        this.expression = expression;

        this.addChild(expression);
    }

    hashCode(): number {
        return JavaObjects.hash(this.expression);
    }

    equals(other: unknown): boolean {
        if (this === other) return true;
        if (!(other instanceof ExpressionStringPart)) return false;
        return JavaObjects.equals(this.expression, other.expression);
    }

    toString(): string {
        return new ToStringHelper(this)
            .add("expression", this.expression)
            .toString();
    }
}