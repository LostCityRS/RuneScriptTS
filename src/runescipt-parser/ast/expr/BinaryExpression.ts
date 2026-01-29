import { JavaObjects } from '../../runescript/util/JavaObjects';
import { ToStringHelper } from '../../runescript/util/ToStringHelper';
import { AstVisitor } from '../AstVisitor';
import { NodeSourceLocation } from '../NodeSourceLocation';
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

  protected constructor(
    source: NodeSourceLocation,
    left: Expression,
    operator: Token,
    right: Expression
  ) {
    super(source);
    this.left = left;
    this.operator = operator;
    this.right = right;

    this.addChild(left);
    this.addChild(operator);
    this.addChild(right);
  }

  accept<R>(visitor: AstVisitor<R>): R {
    return visitor.visitBinaryExpression(this);
  }

  hashCode(): number {
    return JavaObjects.hash(this.left, this.operator, this.right);
  }

  equals(other: unknown): boolean {
    if (this === other) return true;
    if (!(other instanceof BinaryExpression)) return false;
    return (
      JavaObjects.equals(this.left, other.left) &&
      JavaObjects.equals(this.operator, other.operator) &&
      JavaObjects.equals(this.right, other.right)
    );
  }

  toString(): string {
    return new ToStringHelper(this)
      .add("left", this.left)
      .add("operator", this.operator)
      .add("right", this.right)
      .toString();
  }
}