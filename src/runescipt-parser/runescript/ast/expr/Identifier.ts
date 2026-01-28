import { Hashable } from "../../util/Hashable";
import { JavaObjects } from "../../util/JavaObjects";
import { ToStringHelper } from "../../util/ToStringHelper";
import { AstVisitor } from "../AstVisitor";
import { NodeSourceLocation } from "../NodeSourceLocation";
import { Expression } from "./Expression";

/**
 * Represent some kind of identifier within code.
 * 
 * Examples: `abyssal_whip`, `smithing:arrowheads`
 */
export class Identifier extends Expression implements Hashable {
    public readonly text: string;

    constructor(source: NodeSourceLocation, text: string) {
        super(source);
        this.text = text;
    }

    accept<R>(visitor: AstVisitor<R>): R {
        return visitor.visitIdentifier(this);
    }

    public hashCode(): number {
        return JavaObjects.hash(this.text);
    }

    equals(other: unknown): boolean {
        if (this === other) return true;
        if (!(other instanceof Identifier)) return false;

        return JavaObjects.equals(this.text, other.text);
    }

    toString(): string {
        return new ToStringHelper(this)
            .add("text", this.text)
            .toString();
    }
}