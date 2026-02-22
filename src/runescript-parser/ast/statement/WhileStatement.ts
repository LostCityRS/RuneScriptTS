import { AstVisitor } from '#/runescript-parser/ast/AstVisitor.js';
import { Expression } from '#/runescript-parser/ast/expr/Expression.js';
import { NodeKind } from '#/runescript-parser/ast/NodeKind.js';
import type { NodeSourceLocation } from '#/runescript-parser/ast/NodeSourceLocation.js';
import { Statement } from '#/runescript-parser/ast/statement/Statement.js';

/**
 * Represents a while statement with a [condition] and the [thenStatement] that is ran when the condition is `true`.
 *
 * Example:
 * ```
 * while ($var < 10) {
 *     mes(tostring($var));
 *     $var = calc($var + 1);
 * }
 * ```
 */
export class WhileStatement extends Statement {
    public readonly kind = NodeKind.WhileStatement;
    public readonly condition: Expression;
    public readonly thenStatement: Statement;

    public constructor(source: NodeSourceLocation, condition: Expression, thenStatement: Statement) {
        super(source);
        this.condition = condition;
        this.thenStatement = thenStatement;

        this.addChild(this.condition);
        this.addChild(this.thenStatement);
    }

    public accept<R>(visitor: AstVisitor<R>): R {
        return visitor.visitWhileStatement(this);
    }
}
