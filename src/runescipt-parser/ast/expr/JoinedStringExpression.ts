import { AstVisitor } from '../AstVisitor';
import { NodeKind } from '../NodeKind';
import type { NodeSourceLocation } from '../NodeSourceLocation';
import { Expression } from './Expression';
import { StringPart } from './StringPart';

/**
 * Represents an interpolated string that contains multiple [parts] to make it up.
 *
 * Example:
 * ```
 * "The value of $var is <$var>."
 * ```
 */
export class JoinedStringExpression extends Expression {
    public readonly kind = NodeKind.JoinedStringExpression;
    public readonly parts: StringPart[];

    public constructor(source: NodeSourceLocation, parts: StringPart[]) {
        super(source);
        this.parts = parts;

        this.addChildren(this.parts);
    }

    public accept<R>(visitor: AstVisitor<R>): R {
        return visitor.visitJoinedStringExpression(this);
    }
}