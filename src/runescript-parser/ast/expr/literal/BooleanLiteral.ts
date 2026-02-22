import { AstVisitor } from '#/runescript-parser/ast/AstVisitor.js';
import { NodeKind } from '#/runescript-parser/ast/NodeKind.js';
import type { NodeSourceLocation } from '#/runescript-parser/ast/NodeSourceLocation.js';
import { Literal } from '#/runescript-parser/ast/expr/literal/Literal.js';

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
