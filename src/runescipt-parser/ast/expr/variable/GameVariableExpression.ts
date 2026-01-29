import { JavaObjects } from "../../../runescript/util/JavaObjects";
import { ToStringHelper } from "../../../runescript/util/ToStringHelper";
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

  hashCode(): number {
    return JavaObjects.hash(this.dot, this.name);
  }

  equals(other: unknown): boolean {
    if (this === other) return true;
    if (!(other instanceof GameVariableExpression)) return false;
    
    return (
      this.dot === other.dot &&
      JavaObjects.equals(this.name, other.name)
    );
  }

  toString(): string {
    return new ToStringHelper(this)
      .add("dot", this.dot)
      .add("name", this.name)
      .toString();
  }
}