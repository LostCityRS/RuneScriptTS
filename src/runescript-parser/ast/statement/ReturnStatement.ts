import { AstVisitor } from '#/runescript-parser/ast/AstVisitor.js';
import { Expression } from '#/runescript-parser/ast/expr/Expression.js';
import { NodeKind } from '#/runescript-parser/ast/NodeKind.js';
import type { NodeSourceLocation } from '#/runescript-parser/ast/NodeSourceLocation.js';
import { Statement } from '#/runescript-parser/ast/statement/Statement.js';

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
