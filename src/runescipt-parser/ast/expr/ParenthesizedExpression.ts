import { Hashable } from '../../../util/Hashable';
import { JavaObjects } from '../../../util/JavaObjects';
import { ToStringHelper } from '../../../util/ToStringHelper';
import { AstVisitor } from '../AstVisitor';
import { NodeSourceLocation } from '../NodeSourceLocation';
import { Expression } from './Expression';

/**
 * Represents an expression that was wrapped in parenthesis.
 *
 * Example:
 * ```
 * ($var1 = 0 | $var2 = 0) & $var3 = 1
 * ```
 */
export class ParenthesizedExpression extends Expression implements Hashable {
  public readonly expression: Expression;

  constructor(source: NodeSourceLocation, expression: Expression) {
    super(source);
    this.expression = expression;

    this.addChild(expression);
  }

  accept<R>(visitor: AstVisitor<R>): R {
    return visitor.visitParenthesizedExpression(this);
  }

  hashCode(): number {
    return JavaObjects.hash(this.expression);
  }

  equals(other: unknown): boolean {
    if (this === other) return true;
    if (!(other instanceof ParenthesizedExpression)) return false;
    return JavaObjects.equals(this.expression, other.expression);
  }

  toString(): string {
    return new ToStringHelper(this)
      .add("expression", this.expression)
      .toString();
  }
}