import { AstVisitor } from '#/parser/ast/AstVisitor.js';
import { NodeKind } from '#/parser/ast/NodeKind.js';
import type { NodeSourceLocation } from '#/parser/ast/NodeSourceLocation.js';

import { Literal } from '#/parser/ast/expr/literal/Literal.js';

/**
 * An implementation of [Literal] for numeric literals.
 *
 * Example:
 * ```
 * 123456
 * ```
 */
export class IntegerLiteral extends Literal<string> {
    public readonly kind = NodeKind.IntegerLiteral;
    public numberValue: number | bigint | null = null;

    public constructor(source: NodeSourceLocation, value: string, public readonly radix: number) {
        super(source, value);
    }

    public accept<R>(visitor: AstVisitor<R>): R {
        return visitor.visitIntegerLiteral(this);
    }

    public static readonly RADIX_BINARY = 2;
    public static readonly RADIX_DECIMAL = 10;
    public static readonly RADIX_HEXADECIMAL = 16;
}
