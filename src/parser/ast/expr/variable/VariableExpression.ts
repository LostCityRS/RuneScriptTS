import { RuneScriptSymbol } from '#/compiler/symbol/Symbol.js';

import type { NodeSourceLocation } from '#/parser/ast/NodeSourceLocation.js';

import { Expression } from '#/parser/ast/expr/Expression.js';
import { Identifier } from '#/parser/ast/expr/Identifier.js';

/**
 * A base representation of a variable being used as an [Expression].
 */
// base class for a variable reference, all have an identifier
export abstract class VariableExpression extends Expression {
    public readonly name: Identifier;

    /**
     * The symbol that the variable references.
     */
    public reference: RuneScriptSymbol | null = null;

    protected constructor(source: NodeSourceLocation, name: Identifier) {
        super(source);
        this.name = name;

        this.addChild(this.name);
    }
}
