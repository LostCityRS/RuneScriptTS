import { AstVisitor } from "../AstVisitor";
import { NodeKind } from "../NodeKind";
import type { NodeSourceLocation } from "../NodeSourceLocation";
import { Token } from "../Token";
import { BinaryExpression } from "./BinaryExpression";
import { Expression } from "./Expression";

/**
 * A type of [BinaryExpression] that is used for conditions within `if` and `while` statements.
 */
export class ConditionExpression extends BinaryExpression {
    public readonly kind = NodeKind.ConditionExpression;

    public constructor(source: NodeSourceLocation, left: Expression, operator: Token, right: Expression) {
      super(source, left, operator, right);
    }

    public accept<R>(visitor: AstVisitor<R>): R {
      return visitor.visitConditionExpression(this);
    }
}