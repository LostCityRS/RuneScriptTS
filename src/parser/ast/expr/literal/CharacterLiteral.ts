import { AstVisitor } from '#/parser/ast/AstVisitor.js';
import { NodeKind } from '#/parser/ast/NodeKind.js';
import type { NodeSourceLocation } from '#/parser/ast/NodeSourceLocation.js';

import { Literal } from '#/parser/ast/expr/literal/Literal.js';

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
