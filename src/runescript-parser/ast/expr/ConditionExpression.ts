import { AstVisitor } from '#/runescript-parser/ast/AstVisitor.js';
import { NodeKind } from '#/runescript-parser/ast/NodeKind.js';
import type { NodeSourceLocation } from '#/runescript-parser/ast/NodeSourceLocation.js';
import { Token } from '#/runescript-parser/ast/Token.js';
import { BinaryExpression } from '#/runescript-parser/ast/expr/BinaryExpression.js';
import { Expression } from '#/runescript-parser/ast/expr/Expression.js';

/**
 * A type of [BinaryExpression] that is used for conditions within `if` and `while` statements.
 */
export class ConditionExpression extends BinaryExpression {
    public readonly kind = NodeKind.ConditionExpression;

    public constructor(source: NodeSourceLocation, left: Expression, operator: Token, right: Expression) {
        super(source, left, operator, right);
    }

    public accept<R>(visitor: AstVisitor<R>): R {
        return visitor.visitConditionExpression(this);
    }
}
