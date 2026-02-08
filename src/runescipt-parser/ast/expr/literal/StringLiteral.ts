import { RuneScriptSymbol } from "../../../../runescript-compiler/symbol/Symbol";
import { AstVisitor } from "../../AstVisitor";
import { NodeKind } from "../../NodeKind";
import type { NodeSourceLocation } from "../../NodeSourceLocation";
import { Expression } from "../Expression";
import { Literal } from "./Literal";

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