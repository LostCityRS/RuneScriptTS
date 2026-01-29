import { JavaObjects } from '../../../runescript/util/JavaObjects';
import { ToStringHelper } from '../../../runescript/util/ToStringHelper';
import { NodeSourceLocation } from '../../NodeSourceLocation';
import { Expression } from '../Expression';

/**
 * An [Expression] that represents a constant value of [T].
 */
export abstract class Literal<T> extends Expression {
  public readonly value: T;

  protected constructor(source: NodeSourceLocation, value: T) {
    super(source);
    this.value = value;
  }

  hashCode(): number {
    return JavaObjects.hash(this.value);
  }

  equals(other: unknown): boolean {
    if (this === other) return true;
    if (!(other instanceof Literal)) return false;
    return JavaObjects.equals(this.value, other.value);
  }

  toString(): string {
    return new ToStringHelper(this)
      .add("value", this.value)
      .toString();
  }
}