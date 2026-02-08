import { Type } from '../../../runescript-compiler/type/Type';
import { Node } from '../Node';
import type { NodeSourceLocation } from '../NodeSourceLocation';

/** 
 * The base expression node that all expressions extend.
 */
export abstract class Expression extends Node {
    protected constructor(source: NodeSourceLocation) {
        super(source);
    }

    /**
     * The type inferred by the type checker. Optional until visited.
     */
    public type: Type | null = null;

    /**
     * Optional type hint for type checking.
     */
    public typeHint: Type | null = null;

    public getNullableType(): Type | null {
        return this.type;
    }

    public getType(): Type {
        if (this.type == null) {
            throw new Error(`Attribute: 'type' should be initialized before get.`);
        } else {
            return this.type;
        }
    }
}