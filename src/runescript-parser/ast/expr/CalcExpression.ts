import { AstVisitor } from '#/runescript-parser/ast/AstVisitor.js';
import { NodeKind } from '#/runescript-parser/ast/NodeKind.js';
import type { NodeSourceLocation } from '#/runescript-parser/ast/NodeSourceLocation.js';
import { Expression } from '#/runescript-parser/ast/expr/Expression.js';

/**
 * An expression that allows doing math operations inside.
 *
 * Example:
 * ```
 * calc(1 + 1 / 2)
 * ```
 */
export class CalcExpression extends Expression {
    public readonly kind = NodeKind.CalcExpression;
    public readonly expression: Expression;

    public constructor(source: NodeSourceLocation, expression: Expression) {
        super(source);
        this.expression = expression;

        this.addChild(this.expression);
    }

    public accept<R>(visitor: AstVisitor<R>): R {
        return visitor.visitCalcExpression(this);
    }
}
