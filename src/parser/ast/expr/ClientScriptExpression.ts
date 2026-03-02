import { AstVisitor } from '#/parser/ast/AstVisitor.js';
import { NodeKind } from '#/parser/ast/NodeKind.js';
import type { NodeSourceLocation } from '#/parser/ast/NodeSourceLocation.js';

import { Expression } from '#/parser/ast/expr/Expression.js';
import { Identifier } from '#/parser/ast/expr/Identifier.js';

import { CallExpression } from '#/parser/ast/expr/call/CallExpression.js';

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
