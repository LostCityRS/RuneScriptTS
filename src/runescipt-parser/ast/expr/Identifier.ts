import { AstVisitor } from "../AstVisitor";
import type { NodeSourceLocation } from "../NodeSourceLocation";
import { Expression } from "./Expression";
import { RuneScriptSymbol } from "../../../runescript-compiler/symbol/Symbol";
import { NodeKind } from "../NodeKind";

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