import { AstVisitor } from '#/runescript-parser/ast/AstVisitor.js';
import { NodeKind } from '#/runescript-parser/ast/NodeKind.js';
import type { NodeSourceLocation } from '#/runescript-parser/ast/NodeSourceLocation.js';
import { Expression } from '#/runescript-parser/ast/expr/Expression.js';
import { Identifier } from '#/runescript-parser/ast/expr/Identifier.js';
import { CallExpression } from '#/runescript-parser/ast/expr/call/CallExpression.js';

/**
 * A CallExpression for command calls.
 */
export class CommandCallExpression extends CallExpression {
    public readonly kind = NodeKind.CommandCallExpression;
    public readonly arguments2: Expression[] | null;

    public constructor(source: NodeSourceLocation, name: Identifier, args: Expression[], args2: Expression[] | null) {
        super(source, name, args);
        this.arguments2 = args2;

        if (this.arguments2) {
            this.addChildren(this.arguments2);
        }
    }

    public get isStar(): boolean {
        return this.arguments2 != null;
    }

    public get nameString(): string {
        return this.isStar ? `${this.name.text}*` : this.name.text;
    }

    public accept<R>(visitor: AstVisitor<R>): R {
        return visitor.visitCommandCallExpression(this);
    }
}
