import { JavaObjects } from '../../runescript/util/JavaObjects';
import { ToStringHelper } from '../../runescript/util/ToStringHelper';
import { AstVisitor } from '../AstVisitor';
import { Expression } from '../expr/Expression';
import { NodeSourceLocation } from '../NodeSourceLocation';
import { Statement } from './Statement';

/**
 * Represents a return statement that can have any number of [expressions].
 *
 * Example:
 * ```
 * return(1, 2, 3);
 * ```
 */
export class ReturnStatement extends Statement {
    public readonly expressions: Expression[];

    constructor(source: NodeSourceLocation, expressions: Expression[]) {
        super(source);
        this.expressions = expressions;

        this.addChildren(expressions);
    }

    accept<R>(visitor: AstVisitor<R>): R {
        return visitor.visitReturnStatement(this);
    }

    hashCode(): number {
        return JavaObjects.hash(this.expressions);
    }

    equals(other: unknown): boolean {
        if (this === other) return true;
        if (!(other instanceof ReturnStatement)) return false;
        
        return JavaObjects.equals(this.expressions, other.expressions);
    }

    toString(): string {
        return new ToStringHelper(this)
            .add("expressions", this.expressions)
            .toString();
    }
}