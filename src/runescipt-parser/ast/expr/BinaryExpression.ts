import { AstVisitor } from '../AstVisitor';
import type { NodeSourceLocation } from '../NodeSourceLocation';
import { Token } from '../Token';
import { Expression } from './Expression';

/**
 * An expression that has a [left] hand side and [right] hand side with an [operator] that specifies what to do
 * with both of them.
 *
 * Example:
 * ```
 * 1 + 1
 * ```
 *
 * @see ConditionExpression
 * @see ArithmeticExpression
 */
export abstract class BinaryExpression extends Expression {
    public readonly left: Expression;
    public readonly operator: Token;
    public readonly right: Expression;

    protected constructor(source: NodeSourceLocation, left: Expression, operator: Token, right: Expression) {
        super(source);
        this.left = left;
        this.operator = operator;
        this.right = right;

        this.addChild(this.left);
        this.addChild(this.operator);
        this.addChild(this.right);
    }

    public accept<R>(visitor: AstVisitor<R>): R {
        return visitor.visitBinaryExpression(this);
    }
}