import { AstVisitor } from "../AstVisitor";
import { NodeSourceLocation } from "../NodeSourceLocation";
import { Token } from "../Token";
import { BinaryExpression } from "./BinaryExpression";
import { Expression } from "./Expression";

/**
 * A type of [BinaryExpression] that is used for arithmetic within [CalcExpression].
 *
 * The valid operators are: `*` (multiply), `/` (divide), `%` (modulo), `+` (add), `-` (subtract), `&` (and), `|` (or).
 */
export class ArithmeticExpression extends BinaryExpression {
  constructor(
    source: NodeSourceLocation,
    left: Expression,
    operator: Token,
    right: Expression
  ) {
    super(source, left, operator, right);
  }

  accept<R>(visitor: AstVisitor<R>): R {
    return visitor.visitArithmeticExpression(this);
  }
}