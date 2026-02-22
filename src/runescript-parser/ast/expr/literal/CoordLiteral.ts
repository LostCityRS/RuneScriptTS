import { AstVisitor } from '#/runescript-parser/ast/AstVisitor.js';
import { NodeKind } from '#/runescript-parser/ast/NodeKind.js';
import type { NodeSourceLocation } from '#/runescript-parser/ast/NodeSourceLocation.js';
import { Literal } from '#/runescript-parser/ast/expr/literal/Literal.js';

/**
 * An implementation of [Literal] for coord literals.
 *
 * Example:
 * ```
 * 0_50_50_0_0
 * ```
 */
export class CoordLiteral extends Literal<number> {
    public readonly kind = NodeKind.CoordLiteral;

    public constructor(source: NodeSourceLocation, value: number) {
        super(source, value);
    }

    public accept<R>(visitor: AstVisitor<R>): R {
        return visitor.visitCoordLiteral(this);
    }
}
