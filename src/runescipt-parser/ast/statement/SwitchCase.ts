import { SymbolTable } from '../../../runescript-compiler/symbol/SymbolTable';
import { AstVisitor } from '../AstVisitor';
import { Expression } from '../expr/Expression';
import { Node } from '../Node';
import { NodeKind } from '../NodeKind';
import type { NodeSourceLocation } from '../NodeSourceLocation';
import { Statement } from './Statement';

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
    public scope: SymbolTable;

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