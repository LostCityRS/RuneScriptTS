import { AstVisitor } from '../AstVisitor';
import { NodeKind } from '../NodeKind';
import type { NodeSourceLocation } from '../NodeSourceLocation';
import { Expression } from './Expression';

/**
 * Represents an expression that was wrapped in parenthesis.
 *
 * Example:
 * ```
 * ($var1 = 0 | $var2 = 0) & $var3 = 1
 * ```
 */
export class ParenthesizedExpression extends Expression {
    public readonly kind = NodeKind.ParenthesizedExpression;
    public readonly expression: Expression;

    public constructor(source: NodeSourceLocation, expression: Expression) {
        super(source);
        this.expression = expression;

        this.addChild(this.expression);
    }

    public accept<R>(visitor: AstVisitor<R>): R {
        return visitor.visitParenthesizedExpression(this);
    }
}