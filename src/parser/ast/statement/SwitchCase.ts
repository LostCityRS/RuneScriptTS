import { SymbolTable } from '#/compiler/symbol/SymbolTable.js';

import { AstVisitor } from '#/parser/ast/AstVisitor.js';
import { Node } from '#/parser/ast/Node.js';
import { NodeKind } from '#/parser/ast/NodeKind.js';
import type { NodeSourceLocation } from '#/parser/ast/NodeSourceLocation.js';

import { Expression } from '#/parser/ast/expr/Expression.js';

import { Statement } from '#/parser/ast/statement/Statement.js';

/**
 * Represents a single [SwitchStatement] case. Contains the [keys] and the [statements] to run when the switch
 * statements condition matches one of the keys.
 *
 * See [SwitchStatement] for example.
 */
export class SwitchCase extends Node {
    public readonly kind = NodeKind.SwitchCase;
    public readonly keys: Expression[];
    public readonly statements: Statement[];

    public constructor(source: NodeSourceLocation, keys: Expression[], statements: Statement[]) {
        super(source);
        this.keys = keys;
        this.statements = statements;

        this.addChildren(this.keys);
        this.addChildren(this.statements);
    }

    /**
     * Whether or not this switch case qualifies as the default case.
     */
    public get isDefault(): boolean {
        return this.keys.length === 0;
    }

    public accept<R>(visitor: AstVisitor<R>): R {
        return visitor.visitSwitchCase(this);
    }
}
