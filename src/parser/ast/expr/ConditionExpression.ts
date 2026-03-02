import { AstVisitor } from '#/parser/ast/AstVisitor.js';
import { NodeKind } from '#/parser/ast/NodeKind.js';
import type { NodeSourceLocation } from '#/parser/ast/NodeSourceLocation.js';
import { Token } from '#/parser/ast/Token.js';

import { BinaryExpression } from '#/parser/ast/expr/BinaryExpression.js';
import { Expression } from '#/parser/ast/expr/Expression.js';

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
