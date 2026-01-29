import { JavaObjects } from '../../runescript/util/JavaObjects';
import { ToStringHelper } from '../../runescript/util/ToStringHelper';
import { AstVisitor } from '../AstVisitor';
import { Expression } from '../expr/Expression';
import { NodeSourceLocation } from '../NodeSourceLocation';
import { Statement } from './Statement';

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
    public readonly condition: Expression;
    public readonly thenStatement: Statement;
    public readonly elseStatement?: Statement;

    constructor(
        source: NodeSourceLocation,
        condition: Expression,
        thenStatement: Statement,
        elseStatement?: Statement
    ) {
        super(source);
        this.condition = condition;
        this.thenStatement = thenStatement;
        this.elseStatement = elseStatement;

        this.addChild(condition);
        this.addChild(thenStatement);
        if (elseStatement) {
            this.addChild(elseStatement);
        }
    }

    accept<R>(visitor: AstVisitor<R>): R {
         return visitor.visitIfStatement(this);
    }

    hashCode(): number {
        return JavaObjects.hash(this.condition, this.thenStatement, this.elseStatement);
    }

    equals(other: unknown): boolean {
        if (this === other) return true;
        if (!(other instanceof IfStatement)) return false;
        
        return (
            JavaObjects.equals(this.condition, other.condition) &&
            JavaObjects.equals(this.thenStatement, other.thenStatement) &&
            JavaObjects.equals(this.elseStatement, other.elseStatement)
        );
    }

    toString(): string {
        return new ToStringHelper(this)
            .add("condition", this.condition)
            .add("thenStatement", this.thenStatement)
            .add("elseStatement", this.elseStatement)
            .toString();
    }
}