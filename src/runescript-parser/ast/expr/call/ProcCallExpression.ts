import { AstVisitor } from '#/runescript-parser/ast/AstVisitor.js';
import { NodeKind } from '#/runescript-parser/ast/NodeKind.js';
import type { NodeSourceLocation } from '#/runescript-parser/ast/NodeSourceLocation.js';
import { Expression } from '#/runescript-parser/ast/expr/Expression.js';
import { Identifier } from '#/runescript-parser/ast/expr/Identifier.js';
import { CallExpression } from '#/runescript-parser/ast/expr/call/CallExpression.js';

/**
 * A CallExpression for calling other (proc) scripts.
 */
export class ProcCallExpression extends CallExpression {
    public readonly kind = NodeKind.ProcCallExpression;

    public constructor(source: NodeSourceLocation, name: Identifier, args: Expression[]) {
        super(source, name, args);
    }

    public accept<R>(visitor: AstVisitor<R>): R {
        return visitor.visitProcCallExpression(this);
    }
}
