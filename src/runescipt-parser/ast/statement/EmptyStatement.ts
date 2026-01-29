import { JavaObjects } from '../../runescript/util/JavaObjects';
import { ToStringHelper } from '../../runescript/util/ToStringHelper';
import { AstVisitor } from '../AstVisitor';
import { NodeSourceLocation } from '../NodeSourceLocation';
import { Statement } from './Statement';

/**
 * Represents a statement with no code attached.
 *
 * Example:
 * ```
 * ;
 * ```
 */
export class EmptyStatement extends Statement {
    constructor(source: NodeSourceLocation) {
        super(source);
    }

    accept<R>(visitor: AstVisitor<R>): R {
        return visitor.visitEmptyStatement(this);
    }

    hashCode(): number {
        return JavaObjects.hash(EmptyStatement.name);
    }

    equals(other: unknown): boolean {
        return other instanceof EmptyStatement;
    }

    toString(): string {
        return new ToStringHelper(this).toString();
    }
}