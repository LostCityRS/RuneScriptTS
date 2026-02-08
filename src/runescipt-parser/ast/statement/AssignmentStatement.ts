import { AstVisitor } from '../AstVisitor';
import { Expression } from '../expr/Expression';
import { VariableExpression } from '../expr/variable/VariableExpression';
import { NodeKind } from '../NodeKind';
import type { NodeSourceLocation } from '../NodeSourceLocation';
import { Statement } from './Statement';

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