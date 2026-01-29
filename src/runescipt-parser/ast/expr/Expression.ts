import { BasicSymbol } from '../../../runescript-compiler/symbol/Symbol';
import { Type } from '../../../runescript-compiler/type/Type';
import { Node } from '../Node';
import { NodeSourceLocation } from '../NodeSourceLocation';

/** 
 * The base expression node that all expressions extend.
 */
export abstract class Expression extends Node {
    constructor(source: NodeSourceLocation) {
        super(source);
    }

    /**
     * The type inferred by the type checker. Optional until visited.
     */
    public type?: Type;

    /**
     * Returns the type if it exists, otherwise undefined.
     */
    public get nullableType(): Type | undefined {
        return this.type;
    }

    /**
     * Optional type hint for type checking.
     */
    public typeHint?: Type

    /**
     * Optional reference to a symbol.
     */
    public reference?: BasicSymbol;
}