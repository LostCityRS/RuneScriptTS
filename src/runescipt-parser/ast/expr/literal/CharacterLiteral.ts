import { AstVisitor } from "../../AstVisitor";
import { NodeKind } from "../../NodeKind";
import type { NodeSourceLocation } from "../../NodeSourceLocation";
import { Literal } from "./Literal";

/**
 * An implementation of [Literal] for character literals.
 *
 * Example:
 * ```
 * 'c'
 * ```
 */
export class CharacterLiteral extends Literal<string> {
    public readonly kind = NodeKind.CharacterLiteral;

    public constructor(source: NodeSourceLocation, value: string) {
        super(source, value);
    }

    public accept<R>(visitor: AstVisitor<R>): R {
        return visitor.visitCharacterLiteral(this);
    }
}
