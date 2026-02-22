import { AstVisitor } from '#/runescript-parser/ast/AstVisitor.js';
import { Expression } from '#/runescript-parser/ast/expr/Expression.js';
import { NodeKind } from '#/runescript-parser/ast/NodeKind.js';
import type { NodeSourceLocation } from '#/runescript-parser/ast/NodeSourceLocation.js';
import { Statement } from '#/runescript-parser/ast/statement/Statement.js';

/**
 * Represents an if statement that has a [condition], [thenStatement], and an optional [elseStatement].
 *
 * Example:
 * ```
 * if ($var1 = $var2) {
 *     mes("equal");
 * } else {
 *     mes("not equal");
 * }
 * ```
 */
export class IfStatement extends Statement {
    public readonly kind = NodeKind.IfStatement;
    public readonly condition: Expression;
    public readonly thenStatement: Statement;
    public readonly elseStatement: Statement | null;

    public constructor(source: NodeSourceLocation, condition: Expression, thenStatement: Statement, elseStatement: Statement | null) {
        super(source);
        this.condition = condition;
        this.thenStatement = thenStatement;
        this.elseStatement = elseStatement;

        this.addChild(this.condition);
        this.addChild(this.thenStatement);
        this.addChild(this.elseStatement);
    }

    public accept<R>(visitor: AstVisitor<R>): R {
        return visitor.visitIfStatement(this);
    }
}
