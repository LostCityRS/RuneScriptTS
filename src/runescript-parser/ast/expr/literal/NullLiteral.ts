import { AstVisitor } from '#/runescript-parser/ast/AstVisitor.js';
import { NodeKind } from '#/runescript-parser/ast/NodeKind.js';
import type { NodeSourceLocation } from '#/runescript-parser/ast/NodeSourceLocation.js';
import { Literal } from '#/runescript-parser/ast/expr/literal/Literal.js';

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
