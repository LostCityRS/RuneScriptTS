import { AstVisitor } from "../../AstVisitor";
import { NodeSourceLocation } from "../../NodeSourceLocation";
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
    constructor(source: NodeSourceLocation, value: boolean) {
        super(source, value);
    }

    accept<R>(visitor: AstVisitor<R>): R {
        return visitor.visitBooleanLiteral(this);    
    }
}