import { AstVisitor } from "../../AstVisitor";
import { NodeKind } from "../../NodeKind";
import type { NodeSourceLocation } from "../../NodeSourceLocation";
import { Identifier } from "../Identifier";
import { VariableExpression } from "./VariableExpression";

/**
 * A [VariableExpression] implementation used for local variables within a script.
 *
 * Example:
 * ```
 * $var
 * ```
 */
export class GameVariableExpression extends VariableExpression {
    public readonly kind = NodeKind.GameVariableExpression;
    public readonly dot: boolean;

    public constructor(source: NodeSourceLocation, dot: boolean, name: Identifier) {
        super(source, name);
        this.dot = dot;
    }

    public accept<R>(visitor: AstVisitor<R>): R {
        return visitor.visitGameVariableExpression(this);
    }
}