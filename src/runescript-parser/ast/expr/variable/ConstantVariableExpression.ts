import { AstVisitor } from '#/runescript-parser/ast/AstVisitor.js';
import { NodeKind } from '#/runescript-parser/ast/NodeKind.js';
import type { NodeSourceLocation } from '#/runescript-parser/ast/NodeSourceLocation.js';
import { Expression } from '#/runescript-parser/ast/expr/Expression.js';
import { Identifier } from '#/runescript-parser/ast/expr/Identifier.js';
import { VariableExpression } from '#/runescript-parser/ast/expr/variable/VariableExpression.js';

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
