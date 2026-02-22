import { AstVisitor } from '#/runescript-parser/ast/AstVisitor.js';
import { NodeKind } from '#/runescript-parser/ast/NodeKind.js';
import type { NodeSourceLocation } from '#/runescript-parser/ast/NodeSourceLocation.js';
import { CallExpression } from '#/runescript-parser/ast/expr/call/CallExpression.js';
import { Expression } from '#/runescript-parser/ast/expr/Expression.js';
import { Identifier } from '#/runescript-parser/ast/expr/Identifier.js';

/**
 * A parsed ClientScript reference.
 *
 * Example:
 * ```
 * some_handler(){var1}
 * ```
 */
export class ClientScriptExpression extends CallExpression {
    public readonly kind = NodeKind.ClientScriptExpression;
    public readonly transmitList: Expression[];

    public constructor(source: NodeSourceLocation, name: Identifier, argumentsList: Expression[], transmitList: Expression[]) {
        super(source, name, argumentsList);
        this.transmitList = transmitList;

        this.addChildren(this.transmitList);
    }

    public accept<R>(visitor: AstVisitor<R>): R {
        return visitor.visitClientScriptExpression(this);
    }
}
