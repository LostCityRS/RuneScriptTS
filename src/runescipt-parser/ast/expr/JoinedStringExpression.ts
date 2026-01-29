import { Hashable } from '../../runescript/util/Hashable';
import { JavaObjects } from '../../runescript/util/JavaObjects';
import { ToStringHelper } from '../../runescript/util/ToStringHelper';
import { AstVisitor } from '../AstVisitor';
import { NodeSourceLocation } from '../NodeSourceLocation';
import { Expression } from './Expression';
import { StringPart } from './StringPart';

/**
 * Represents an interpolated string that contains multiple [parts] to make it up.
 *
 * Example:
 * ```
 * "The value of $var is <$var>."
 * ```
 */
export class JoinedStringExpression extends Expression implements Hashable {
    public readonly parts: StringPart[];

    constructor(source: NodeSourceLocation, parts: StringPart[]) {
        super(source);
        this.parts = parts;

        this.addChildren(parts);
    }

    accept<R>(visitor: AstVisitor<R>): R {
        return visitor.visitJoinedStringExpression(this);
    }

    hashCode(): number {
        return JavaObjects.hash(...this.parts);
    }

    equals(other: unknown): boolean {
        if (this === other) return true;
        if (!(other instanceof JoinedStringExpression)) return false;
        if (this.parts.length !== other.parts.length) return false;

        for (let i = 0; i < this.parts.length; i++) {
            if (!JavaObjects.equals(this.parts[i], other.parts[i])) {
                return false;
            }
        }

    return true;
    }

    toString(): string {
        return new ToStringHelper(this)
        .add("parts", this.parts)
        .toString();
    }
}