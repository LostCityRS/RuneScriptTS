import { AstVisitor } from '#/parser/ast/AstVisitor.js';
import { NodeKind } from '#/parser/ast/NodeKind.js';
import type { NodeSourceLocation } from '#/parser/ast/NodeSourceLocation.js';

import { Identifier } from '#/parser/ast/expr/Identifier.js';

import { VariableExpression } from '#/parser/ast/expr/variable/VariableExpression.js';

/**
 * A [VariableExpression] implementation used for local variables within a script.
 *
 * Example:
 * ```
 * $var
 * ```
 */
export class GameVariableExpression extends VariableExpression {
    public readonly kind = NodeKind.GameVariableExpression;
    public readonly dot: boolean;

    public constructor(source: NodeSourceLocation, dot: boolean, name: Identifier) {
        super(source, name);
        this.dot = dot;
    }

    public accept<R>(visitor: AstVisitor<R>): R {
        return visitor.visitGameVariableExpression(this);
    }
}
