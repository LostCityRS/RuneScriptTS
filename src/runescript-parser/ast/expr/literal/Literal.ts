import type { RuneScriptSymbol } from '#/runescript-compiler/symbol/Symbol.js';

import type { NodeSourceLocation } from '#/runescript-parser/ast/NodeSourceLocation.js';

import { Expression } from '#/runescript-parser/ast/expr/Expression.js';

/**
 * An [Expression] that represents a constant value of [T].
 */
export abstract class Literal<T> extends Expression {
    public readonly value: T;
    public reference: RuneScriptSymbol | null = null;

    protected constructor(source: NodeSourceLocation, value: T) {
        super(source);
        this.value = value;
    }
}
