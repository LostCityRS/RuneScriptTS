import { Node } from './Node';
import { Hashable } from '../util/Hashable';
import { Identifier } from './expr/Identifier';
import { NodeSourceLocation } from './NodeSourceLocation';
import { Token } from './Token';
import { AstVisitor } from './AstVisitor';
import { JavaObjects } from '../util/JavaObjects';
import { ToStringHelper } from '../util/ToStringHelper';

/**
 * Represent a single parameter in a [Script].
 * 
 * Example:
 * ```
 * int $some_name
 * ```
 */
export class Parameter extends Node implements Hashable {
    public readonly typeToken: Token;
    public readonly name: Identifier;

    constructor(source: NodeSourceLocation, typeToken: Token, name: Identifier) {
        super(source);
        this.typeToken = typeToken;
        this.name = name;

        // Mirror Kotlin init
        this.addChild(typeToken);
        this.addChild(name);
    }

    accept<R>(visitor: AstVisitor<R>): R {
        return visitor.visitParameter(this);
    }

    public hashCode(): number {
        return JavaObjects.hash(this.typeToken, this.name);
    }

    public equals(other: unknown): boolean {
        if (this === other) return true;
        if (!(other instanceof Parameter)) return false;

        return (
            JavaObjects.equals(this.typeToken, other.typeToken) &&
            JavaObjects.equals(this.name, other.name)
        );
    }

    public toString(): string {
        return new ToStringHelper(this)
            .add("typeToken", this.typeToken)
            .add("name", this.name)
            .toString();
    }
}