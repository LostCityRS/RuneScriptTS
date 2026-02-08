import { AstVisitor } from '../AstVisitor';
import { Expression } from '../expr/Expression';
import { NodeKind } from '../NodeKind';
import type { NodeSourceLocation } from '../NodeSourceLocation';
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
    public readonly kind = NodeKind.ReturnStatement;
    public readonly expressions: Expression[];

    public constructor(source: NodeSourceLocation, expressions: Expression[]) {
        super(source);
        this.expressions = expressions;

        this.addChildren(this.expressions);
    }

    public accept<R>(visitor: AstVisitor<R>): R {
        return visitor.visitReturnStatement(this);
    }
}