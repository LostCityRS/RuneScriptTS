import { AstVisitor } from "../../AstVisitor";
import { NodeKind } from "../../NodeKind";
import type { NodeSourceLocation } from "../../NodeSourceLocation";
import { Literal } from "./Literal";

/**
 * An implementation of [Literal] for boolean (`true`/`false`) literals.
 *
 * Example:
 * ```
 * true
 * ```
 */
export class BooleanLiteral extends Literal<boolean> {
    public readonly kind = NodeKind.BooleanLiteral;

    public constructor(source: NodeSourceLocation, value: boolean) {
        super(source, value);
    }

    public accept<R>(visitor: AstVisitor<R>): R {
        return visitor.visitBooleanLiteral(this);    
    }
}