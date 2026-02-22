import { AstVisitor } from '#/runescript-parser/ast/AstVisitor.js';
import { Expression } from '#/runescript-parser/ast/expr/Expression.js';
import { VariableExpression } from '#/runescript-parser/ast/expr/variable/VariableExpression.js';
import { NodeKind } from '#/runescript-parser/ast/NodeKind.js';
import type { NodeSourceLocation } from '#/runescript-parser/ast/NodeSourceLocation.js';
import { Statement } from '#/runescript-parser/ast/statement/Statement.js';

/**
 * Represents a statement that defines [vars] (LHS) to set their values to the result of [expressions] (RHS).
 *
 * Syntax:
 * ```
 * $var1, $var2 = 1, 2;
 * ```
 */
export class AssignmentStatement extends Statement {
    public readonly kind = NodeKind.AssignmentStatement;
    public readonly vars: VariableExpression[];
    public readonly expressions: Expression[];

    public constructor(source: NodeSourceLocation, vars: VariableExpression[], expressions: Expression[]) {
        super(source);
        this.vars = vars;
        this.expressions = expressions;

        this.addChildren(this.vars);
        this.addChildren(this.expressions);
    }

    public accept<R>(visitor: AstVisitor<R>): R {
        return visitor.visitAssignmentStatement(this);
    }
}
