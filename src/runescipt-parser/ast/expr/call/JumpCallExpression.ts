import { Hashable } from "../../../runescript/util/Hashable";
import { JavaObjects } from "../../../runescript/util/JavaObjects";
import { AstVisitor } from "../../AstVisitor";
import { CallExpression } from "./CallExpression";

/**
 * A CallExpression for jumping to a label.
 */
export class JumpCallExpression extends CallExpression implements Hashable {
  accept<R>(visitor: AstVisitor<R>): R {
    return visitor.visitJumpCallExpression(this);
  }

  hashCode(): number {
    return JavaObjects.hash(this.name, this.arguments);
  }

  equals(other: unknown): boolean {
    if (this === other) return true;
    if (!(other instanceof JumpCallExpression)) return false;
    return (
      JavaObjects.equals(this.name, other.name) &&
      JavaObjects.equals(this.arguments, other.arguments)
    );
  }
}