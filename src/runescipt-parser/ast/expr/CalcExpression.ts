import { Hashable } from "../../runescript/util/Hashable";
import { JavaObjects } from "../../runescript/util/JavaObjects";
import { ToStringHelper } from "../../runescript/util/ToStringHelper";
import { AstVisitor } from "../AstVisitor";
import { NodeSourceLocation } from "../NodeSourceLocation";
import { Expression } from "./Expression";

/**
 * An expression that allows doing math operations inside.
 * 
 * Example:
 * ```
 * calc(1 + 1 / 2)
 * ```
 */
export class CalcExpression extends Expression implements Hashable {
    public readonly expression: Expression;
    
    constructor(source: NodeSourceLocation, expression: Expression) {
        super(source);
        this.expression = expression;

        this.addChild(expression);
    }

    accept<R>(visitor: AstVisitor<R>): R {
        return visitor.visitCalcExpression(this);
    }

    hashCode(): number {
        return JavaObjects.hash(this.expression);
    }

    equals(other: unknown): boolean {
        if (this === other) return true;
        if (!(other instanceof CalcExpression)) return false;
        return JavaObjects.equals(this.expression, other.expression);
    }

    toString(): string {
        return new ToStringHelper(this)
            .add("expression", this.expression)
            .toString();
    }
} 