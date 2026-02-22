import { AstVisitor } from '#/runescript-parser/ast/AstVisitor.js';
import { NodeKind } from '#/runescript-parser/ast/NodeKind.js';
import type { NodeSourceLocation } from '#/runescript-parser/ast/NodeSourceLocation.js';
import { Expression } from '#/runescript-parser/ast/expr/Expression.js';

/**
 * Represents an expression that was wrapped in parenthesis.
 *
 * Example:
 * ```
 * ($var1 = 0 | $var2 = 0) & $var3 = 1
 * ```
 */
export class ParenthesizedExpression extends Expression {
    public readonly kind = NodeKind.ParenthesizedExpression;
    public readonly expression: Expression;

    public constructor(source: NodeSourceLocation, expression: Expression) {
        super(source);
        this.expression = expression;

        this.addChild(this.expression);
    }

    public accept<R>(visitor: AstVisitor<R>): R {
        return visitor.visitParenthesizedExpression(this);
    }
}
