import { JavaObjects } from '../../util/JavaObjects';
import { ToStringHelper } from '../../util/ToStringHelper';
import { AstVisitor } from '../AstVisitor';
import { Expression } from '../expr/Expression';
import { NodeSourceLocation } from '../NodeSourceLocation';
import { Statement } from './Statement';

/**
 * Represents a while statement with a [condition] and the [thenStatement] that is ran when the condition is `true`.
 *
 * Example:
 * ```
 * while ($var < 10) {
 *     mes(tostring($var));
 *     $var = calc($var + 1);
 * }
 * ```
 */
export class WhileStatement extends Statement {
    public readonly condition: Expression;
    public readonly thenStatement: Statement;
    constructor(
        source: NodeSourceLocation,
        condition: Expression,
        thenStatement: Statement
    ) {
        super(source);
        this.condition = condition;
        this.thenStatement = thenStatement;
    
        this.addChild(condition);
        this.addChild(thenStatement);
  }

  accept<R>(visitor: AstVisitor<R>): R {
      return visitor.visitWhileStatement(this);
  }

  hashCode(): number {
      return JavaObjects.hash(this.condition, this.thenStatement);
  }

  equals(other: unknown): boolean {
      if (this === other) return true;
      if (!(other instanceof WhileStatement)) return false;
      return (
        JavaObjects.equals(this.equals, other.condition) &&
        JavaObjects.equals(this.thenStatement, other.thenStatement)
      );
  }

  toString(): string {
    return new ToStringHelper(this)
        .add("condition", this.condition)
        .add("thenStatement", this.thenStatement)
        .toString();
  }
}