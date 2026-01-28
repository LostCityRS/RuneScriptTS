import { JavaObjects } from '../../util/JavaObjects';
import { ToStringHelper } from '../../util/ToStringHelper';
import { AstVisitor } from '../AstVisitor';
import { Expression } from '../expr/Expression';
import { VariableExpression } from '../expr/variable/VariableExpression';
import { NodeSourceLocation } from '../NodeSourceLocation';
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
    public readonly vars: VariableExpression[];
    public readonly expressions: Expression[];

    constructor(
        source: NodeSourceLocation,
        vars: VariableExpression[],
        expressions: Expression[]
    ) {
        super(source);
        this.vars = vars;
        this.expressions = expressions;

        this.addChildren(vars);
        this.addChildren(expressions);
    }

    accept<R>(visitor: AstVisitor<R>): R {
        return visitor.visitAssignmentStatement(this);
    }

    hashCode(): number {
        return JavaObjects.hash(this.vars, this.expressions);
    }

    equals(other: unknown): boolean {
        if (this === other) return true;
        if (!(other instanceof AssignmentStatement)) return false;

        return (
            JavaObjects.equals(this.vars, other.vars) &&
            JavaObjects.equals(this.expressions, other.expressions)
        );
    }

    toString(): string {
        return new ToStringHelper(this)
            .add("vars", this.vars)
            .add("expressions", this.expressions)
            .toString();
    }
}