import type { NodeSourceLocation } from '../../NodeSourceLocation';
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
}