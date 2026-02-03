import { AstVisitor } from "../../AstVisitor";
import { NodeSourceLocation } from "../../NodeSourceLocation";
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
  public readonly dot: boolean;

  constructor(
    source: NodeSourceLocation,
    dot: boolean,
    name: Identifier
  ) {
    super(source, name);
    this.dot = dot;
  }

  accept<R>(visitor: AstVisitor<R>): R {
    return visitor.visitGameVariableExpression(this);
  }
}