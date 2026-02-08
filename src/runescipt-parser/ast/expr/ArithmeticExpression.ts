import { AstVisitor } from "../AstVisitor";
import { NodeKind } from "../NodeKind";
import type { NodeSourceLocation } from "../NodeSourceLocation";
import { Token } from "../Token";
import { BinaryExpression } from "./BinaryExpression";
import { Expression } from "./Expression";

/**
 * A type of [BinaryExpression] that is used for arithmetic within [CalcExpression].
 *
 * The valid operators are: `*` (multiply), `/` (divide), `%` (modulo), `+` (add), `-` (subtract), `&` (and), `|` (or).
 */
export class ArithmeticExpression extends BinaryExpression {
    public readonly kind = NodeKind.ArithmeticExpression;  

    public constructor(source: NodeSourceLocation, left: Expression, operator: Token, right: Expression) {
        super(source, left, operator, right);
    }

    public accept<R>(visitor: AstVisitor<R>): R {
        return visitor.visitArithmeticExpression(this);
    }
}