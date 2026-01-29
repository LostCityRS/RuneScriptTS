import { AstVisitor } from "../../AstVisitor";
import { NodeSourceLocation } from "../../NodeSourceLocation";
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
  constructor(source: NodeSourceLocation, value: string) {
    super(source, value);
  }

  accept<R>(visitor: AstVisitor<R>): R {
    return visitor.visitCharacterLiteral(this);
  }
}
