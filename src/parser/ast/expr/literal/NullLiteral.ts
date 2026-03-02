import { AstVisitor } from '#/parser/ast/AstVisitor.js';
import { NodeKind } from '#/parser/ast/NodeKind.js';
import type { NodeSourceLocation } from '#/parser/ast/NodeSourceLocation.js';

import { Literal } from '#/parser/ast/expr/literal/Literal.js';

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
