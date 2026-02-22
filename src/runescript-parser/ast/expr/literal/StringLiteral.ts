import { RuneScriptSymbol } from '#/runescript-compiler/symbol/Symbol.js';
import { AstVisitor } from '#/runescript-parser/ast/AstVisitor.js';
import { NodeKind } from '#/runescript-parser/ast/NodeKind.js';
import type { NodeSourceLocation } from '#/runescript-parser/ast/NodeSourceLocation.js';
import { Expression } from '#/runescript-parser/ast/expr/Expression.js';
import { Literal } from '#/runescript-parser/ast/expr/literal/Literal.js';

/**
 * An implementation of [Literal] for string literals. Not to be confused with [JoinedStringExpression] which supports
 * interpolation within the string.
 *
 * Example:
 * ```
 * "Some string"
 * ```
 */
export class StringLiteral extends Literal<string> {
    public readonly kind = NodeKind.StringLiteral;
    public symbol: RuneScriptSymbol | null = null;
    public subExpression: Expression | null = null;

    constructor(source: NodeSourceLocation, value: string) {
        super(source, value);
    }

    accept<R>(visitor: AstVisitor<R>): R {
        return visitor.visitStringLiteral(this);
    }
}
