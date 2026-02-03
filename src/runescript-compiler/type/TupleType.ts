import { BaseVarType } from './BaseVarType';
import { Type } from './Type';
import { MetaType } from './MetaType';
import { MutableOptionsType, TypeOptions } from './TypeOptions';

/**
 * A single type that combines multiple other types into one while still providing access to the other types.
 */
export class TupleType implements Type {
    /**
     * A flattened array of types this tuple contains.
     */
    public readonly children: Type[];

    public readonly representation: string;
    public readonly code: string | null = null;
    public readonly baseType: BaseVarType | null = null;
    public readonly defaultValue: any = null;
    public readonly options: TypeOptions = new MutableOptionsType({
        allowArray: false,
        allowSwitch: false,
        allowDeclaration: false,
    });

    constructor(...children: Type[]) {
        const flattened = TupleType.flatten(children);
        if (flattened.length < 2) {
            throw new Error("TupleType should not be used when type count is < 2");
        }
        this.children = flattened;
        this.representation = this.children.map((c) => c.representation).join(",");
    }

    /**
     * Converts a `Type[]` into a singular [Type].
     *
     * - If the [] is `null` or empty, [MetaType.Unit] is returned.
     * - If the [] has a size of `1`, the first entry is returned.
     * - If the [] has a size of over 1, a [TupleType] is returned with all types.
     */
    public static fromList(types?: Type[]): Type {
        if (!types || types.length === 0) return MetaType.Unit;
        if (types.length === 1) return types[0];
        return new TupleType(...types);
    }

    /**
     * Converts the [type] into a `Type[]`.
     *
     * - If the [type] is a [TupleType], [TupleType.children] are returned as a [].
     * - If the [type] is `null`, [MetaType.Unit], or [MetaType.Nothing] an empty [] is returned.
     * - If the [type] is a singular type, and is not `unit`, a [] with just the [type] is returned.
     */
    public static toList(type?: Type | null): Type[] {
        // Special case for null, unit, and nothing since it takes place of there being no types.
        if (!type || type === MetaType.Unit || type === MetaType.Nothing) return [];
        // Special case for tuples since we can convert the children into a [].
        if (type instanceof TupleType) return type.children;
        // All other types just get wrapped in a [].
        return [type];
    }

    private static flatten(types: Type[]): Type[] {
        const result: Type[] = [];
        for (const type of types) {
            if (type instanceof TupleType) {
                result.push(...type.children);
            } else {
                result.push(type);
            }
        }
        return result;
    }
}