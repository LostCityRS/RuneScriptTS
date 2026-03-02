import { AstVisitor } from '#/parser/ast/AstVisitor.js';
import { NodeKind } from '#/parser/ast/NodeKind.js';
import type { NodeSourceLocation } from '#/parser/ast/NodeSourceLocation.js';

import { Expression } from '#/parser/ast/expr/Expression.js';
import { Identifier } from '#/parser/ast/expr/Identifier.js';

import { VariableExpression } from '#/parser/ast/expr/variable/VariableExpression.js';

/**
 * A [VariableExpression] implementation that represents a constant variable reference.
 *
 * Example:
 * ```
 * ^var
 * ```
 */
export class ConstantVariableExpression extends VariableExpression {
    public readonly kind = NodeKind.ConstantVariableExpression;
    public subExpression: Expression | null = null;

    public constructor(source: NodeSourceLocation, name: Identifier) {
        super(source, name);
    }

    public accept<R>(visitor: AstVisitor<R>): R {
        return visitor.visitConstantVariableExpression(this);
    }
}
