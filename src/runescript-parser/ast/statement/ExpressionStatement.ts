import { AstVisitor } from '#/runescript-parser/ast/AstVisitor.js';
import { Expression } from '#/runescript-parser/ast/expr/Expression.js';
import { NodeKind } from '#/runescript-parser/ast/NodeKind.js';
import type { NodeSourceLocation } from '#/runescript-parser/ast/NodeSourceLocation.js';
import { Statement } from '#/runescript-parser/ast/statement/Statement.js';

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
