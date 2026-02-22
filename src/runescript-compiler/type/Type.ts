import { BaseVarType } from '#/runescript-compiler/type/BaseVarType.js';
import { MutableOptionsType, TypeOptions } from '#/runescript-compiler/type/TypeOptions.js';

/**
 * Represents a type that we use in the type system to make sure everything is only assigned the correct thing.
 *
 * @see PrimitiveType
 * @see TupleType
 */
export abstract class Type {
    /**
     * A string used to represent the type. This is what is used in scripts to reference it. E.g. `def_int` or `int`
     * would rely on there being a type with a representation of `int`.
     */
    readonly representation!: string;

    /**
     * The character representation of the type.
     */
    readonly code?: string;

    /**
     * The base type of the type. This type determines which stack the type uses.
     */
    readonly baseType?: BaseVarType;

    /**
     * The default value of the type.
     */
    readonly defaultValue?: unknown;

    /**
     * Options the type allows or disallows.
     */
    readonly options!: TypeOptions;
}

export function createType(type: Omit<Type, 'options'> & Partial<Pick<Type, 'options'>>): Type {
    return {
        options: new MutableOptionsType(),
        ...type
    };
}
