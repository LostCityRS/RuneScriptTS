import { RuneScriptSymbol } from '#/compiler/symbol/Symbol.js';

import { AstVisitor } from '#/parser/ast/AstVisitor.js';
import { NodeKind } from '#/parser/ast/NodeKind.js';
import type { NodeSourceLocation } from '#/parser/ast/NodeSourceLocation.js';

import { Expression } from '#/parser/ast/expr/Expression.js';

/**
 * Represent some kind of identifier within code.
 *
 * Examples: `abyssal_whip`, `smithing:arrowheads`
 */
export class Identifier extends Expression {
    public readonly kind = NodeKind.Identifier;
    public readonly text: string;
    public reference: RuneScriptSymbol | null = null;

    public constructor(source: NodeSourceLocation, text: string) {
        super(source);
        this.text = text;
    }

    public accept<R>(visitor: AstVisitor<R>): R {
        return visitor.visitIdentifier(this);
    }
}
