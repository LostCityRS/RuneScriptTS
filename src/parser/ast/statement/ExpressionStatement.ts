import { AstVisitor } from '#/parser/ast/AstVisitor.js';
import { NodeKind } from '#/parser/ast/NodeKind.js';
import type { NodeSourceLocation } from '#/parser/ast/NodeSourceLocation.js';

import { Expression } from '#/parser/ast/expr/Expression.js';

import { Statement } from '#/parser/ast/statement/Statement.js';

/**
 * Represents an [Expression] that is being called as a statement.
 *
 * Example:
 * ```
 * <cc_settext("Example text")>;
 * ```
 */
export class ExpressionStatement extends Statement {
    public readonly kind = NodeKind.ExpressionStatement;
    public readonly expression: Expression;

    public constructor(source: NodeSourceLocation, expression: Expression) {
        super(source);
        this.expression = expression;

        this.addChild(this.expression);
    }

    public accept<R>(visitor: AstVisitor<R>): R {
        return visitor.visitExpressionStatement(this);
    }
}
