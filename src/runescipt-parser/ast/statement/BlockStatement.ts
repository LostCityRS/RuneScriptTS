import { JavaObjects } from '../../runescript/util/JavaObjects';
import { ToStringHelper } from '../../runescript/util/ToStringHelper';
import { AstVisitor } from '../AstVisitor';
import { NodeSourceLocation } from '../NodeSourceLocation';
import { Statement } from './Statement';

/**
 * Represents a block of statements.
 *
 * Example:
 * ```
 * {
 *    <code here>
 * }
 * ```
 */
export class BlockStatement extends Statement {
    public readonly statements: Statement[];

    constructor(source: NodeSourceLocation, statements: Statement[]) {
        super(source);
        this.statements = statements;

        this.addChildren(statements);
    }

    accept<R>(visitor: AstVisitor<R>): R {
        return visitor.visitBlockStatement(this);
    }

    hashCode(): number {
        return JavaObjects.hash(this.statements);
    }

    equals(other: unknown): boolean {
        if (this === other) return true;
        if (!(other instanceof BlockStatement)) return false;

        return JavaObjects.equals(this.statements, other.statements);
    }

    toString(): string {
        return new ToStringHelper(this)
            .add("statements", this.statements)
            .toString();
    }
}