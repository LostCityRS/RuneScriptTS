import { AstVisitor } from '#/runescript-parser/ast/AstVisitor.js';
import { NodeKind } from '#/runescript-parser/ast/NodeKind.js';
import type { NodeSourceLocation } from '#/runescript-parser/ast/NodeSourceLocation.js';
import { Identifier } from '#/runescript-parser/ast/expr/Identifier.js';
import { VariableExpression } from '#/runescript-parser/ast/expr/variable/VariableExpression.js';

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
