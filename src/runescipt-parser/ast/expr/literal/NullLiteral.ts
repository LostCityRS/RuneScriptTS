import { AstVisitor } from "../../AstVisitor";
import { NodeKind } from "../../NodeKind";
import type { NodeSourceLocation } from "../../NodeSourceLocation";
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
    public readonly kind = NodeKind.NullLiteral;

    public constructor(source: NodeSourceLocation) {
        super(source, -1);
    }

    public accept<R>(visitor: AstVisitor<R>): R {
        return visitor.visitNullLiteral(this);
    }
}