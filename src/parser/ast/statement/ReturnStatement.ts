import { AstVisitor } from '#/parser/ast/AstVisitor.js';
import { NodeKind } from '#/parser/ast/NodeKind.js';
import type { NodeSourceLocation } from '#/parser/ast/NodeSourceLocation.js';

import { Expression } from '#/parser/ast/expr/Expression.js';

import { Statement } from '#/parser/ast/statement/Statement.js';

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
