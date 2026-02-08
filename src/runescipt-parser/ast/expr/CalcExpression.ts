import { AstVisitor } from "../AstVisitor";
import { NodeKind } from "../NodeKind";
import type { NodeSourceLocation } from "../NodeSourceLocation";
import { Expression } from "./Expression";

/**
 * An expression that allows doing math operations inside.
 * 
 * Example:
 * ```
 * calc(1 + 1 / 2)
 * ```
 */
export class CalcExpression extends Expression {
    public readonly kind = NodeKind.CalcExpression;
    public readonly expression: Expression;
    
    public constructor(source: NodeSourceLocation, expression: Expression) {
        super(source);
        this.expression = expression;

        this.addChild(this.expression);
    }

    public accept<R>(visitor: AstVisitor<R>): R {
        return visitor.visitCalcExpression(this);
    }
} 