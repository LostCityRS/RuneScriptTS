import { AstVisitor } from '#/parser/ast/AstVisitor.js';
import { NodeKind } from '#/parser/ast/NodeKind.js';
import type { NodeSourceLocation } from '#/parser/ast/NodeSourceLocation.js';

import { Expression } from '#/parser/ast/expr/Expression.js';
import { Identifier } from '#/parser/ast/expr/Identifier.js';

import { CallExpression } from '#/parser/ast/expr/call/CallExpression.js';

/**
 * A CallExpression for jumping to a label.
 */
export class JumpCallExpression extends CallExpression {
    public readonly kind = NodeKind.JumpCallExpression;

    public constructor(source: NodeSourceLocation, name: Identifier, args: Expression[]) {
        super(source, name, args);
    }

    public accept<R>(visitor: AstVisitor<R>): R {
        return visitor.visitJumpCallExpression(this);
    }
}
