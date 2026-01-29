import { AstVisitor } from "../../AstVisitor";
import { NodeSourceLocation } from "../../NodeSourceLocation";
import { Literal } from "./Literal";

/**
 * An implementation of [Literal] with a constant value of `-1` which is used to represent `null`.
 *
 * Example:
 * ```
 * null
 * ```
 */
export class NullLiteral extends Literal<number> {
  constructor(source: NodeSourceLocation) {
    super(source, -1);
  }

  accept<R>(visitor: AstVisitor<R>): R {
    return visitor.visitNullLiteral(this);
  }
}