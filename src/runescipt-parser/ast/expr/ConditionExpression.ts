import { AstVisitor } from "../AstVisitor";
import { NodeSourceLocation } from "../NodeSourceLocation";
import { Token } from "../Token";
import { BinaryExpression } from "./BinaryExpression";
import { Expression } from "./Expression";

/**
 * A type of [BinaryExpression] that is used for conditions within `if` and `while` statements.
 */
export class ConditionExpression extends BinaryExpression {
  constructor(
    source: NodeSourceLocation,
    left: Expression,
    operator: Token,
    right: Expression
  ) {
    super(source, left, operator, right);
  }

  accept<R>(visitor: AstVisitor<R>): R {
    return visitor.visitConditionExpression(this);
  }
}