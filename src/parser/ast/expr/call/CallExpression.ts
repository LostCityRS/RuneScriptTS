import type { NodeSourceLocation } from '#/parser/ast/NodeSourceLocation.js';

import { Expression } from '#/parser/ast/expr/Expression.js';
import { Identifier } from '#/parser/ast/expr/Identifier.js';

import { RuneScriptSymbol } from '#/compiler/symbol/Symbol.js';

/**
 * The base expression for all types of call expressions.
 */
export abstract class CallExpression extends Expression {
    public readonly name: Identifier;
    public readonly arguments: Expression[];
    public symbol: RuneScriptSymbol | null;

    public constructor(source: NodeSourceLocation, name: Identifier, args: Expression[]) {
        super(source);
        this.name = name;
        this.arguments = args;

        this.addChild(this.name);
        this.addChildren(this.arguments);
    }
}
