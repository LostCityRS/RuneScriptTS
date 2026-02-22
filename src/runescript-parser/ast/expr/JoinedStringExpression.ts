import { AstVisitor } from '#/runescript-parser/ast/AstVisitor.js';
import { NodeKind } from '#/runescript-parser/ast/NodeKind.js';
import type { NodeSourceLocation } from '#/runescript-parser/ast/NodeSourceLocation.js';
import { Expression } from '#/runescript-parser/ast/expr/Expression.js';
import { StringPart } from '#/runescript-parser/ast/expr/StringPart.js';

/**
 * Represents an interpolated string that contains multiple [parts] to make it up.
 *
 * Example:
 * ```
 * "The value of $var is <$var>."
 * ```
 */
export class JoinedStringExpression extends Expression {
    public readonly kind = NodeKind.JoinedStringExpression;
    public readonly parts: StringPart[];

    public constructor(source: NodeSourceLocation, parts: StringPart[]) {
        super(source);
        this.parts = parts;

        this.addChildren(this.parts);
    }

    public accept<R>(visitor: AstVisitor<R>): R {
        return visitor.visitJoinedStringExpression(this);
    }
}
