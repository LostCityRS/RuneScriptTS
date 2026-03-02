import { AstVisitor } from '#/parser/ast/AstVisitor.js';
import { NodeKind } from '#/parser/ast/NodeKind.js';
import type { NodeSourceLocation } from '#/parser/ast/NodeSourceLocation.js';

import { Literal } from '#/parser/ast/expr/literal/Literal.js';

/**
 * An implementation of [Literal] for numeric literals.
 *
 * Example:
 * ```
 * 123456
 * ```
 */
export class IntegerLiteral extends Literal<number> {
    public readonly kind = NodeKind.IntegerLiteral;

    public constructor(source: NodeSourceLocation, value: number) {
        super(source, value);
    }

    public accept<R>(visitor: AstVisitor<R>): R {
        return visitor.visitIntegerLiteral(this);
    }
}
