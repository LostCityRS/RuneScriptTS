import { BaseVarType } from '#/runescript-compiler/type/BaseVarType.js';
import { Type } from '#/runescript-compiler/type/Type.js';
import { MutableOptionsType } from '#/runescript-compiler/type/TypeOptions.js';
import { WrappedType } from '#/runescript-compiler/type/wrapped/WrappedType.js';

/**
 * A [Type] that represents an array of another type.
 */
export class ArrayType implements WrappedType {
    readonly inner: Type;

    readonly options = new MutableOptionsType({
        allowArray: false,
        allowDeclaration: true,
        allowSwitch: true
    });

    constructor(inner: Type) {
        if (inner instanceof ArrayType) {
            throw new Error('ArrayType cannot wrap another ArrayType.');
        }
        this.inner = inner;
    }

    get representation(): string {
        return `${this.inner.representation}array`;
    }

    get code(): never {
        throw new Error('ArrayType has no character representation.');
    }

    get baseType(): BaseVarType {
        return BaseVarType.INTEGER;
    }

    get defaultValue(): never {
        throw new Error('ArrayType hass no default value.');
    }

    toString(): string {
        return `ArrayType{inner=${this.inner}}`;
    }
}
