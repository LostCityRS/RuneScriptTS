import { AstVisitor } from '#/runescript-parser/ast/AstVisitor.js';
import type { NodeSourceLocation } from '#/runescript-parser/ast/NodeSourceLocation.js';
import { Expression } from '#/runescript-parser/ast/expr/Expression.js';
import { RuneScriptSymbol } from '#/runescript-compiler/symbol/Symbol.js';
import { NodeKind } from '#/runescript-parser/ast/NodeKind.js';

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
