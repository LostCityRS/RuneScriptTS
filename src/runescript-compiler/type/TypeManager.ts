import { BaseVarType } from './BaseVarType';
import { Type } from './Type';
import { MutableOptionsType } from './TypeOptions';
import { ArrayType } from './wrapped/ArrayType';

export type TypeChecker = (left: Type, right: Type) => boolean;
export type TypeBuilder = (options: MutableOptionsType) => void;

/**
 * Handles the mapping from name to [Type] along with centralized location for comparing types.
 */
export class TypeManager {
    /**
     * A map of type names to the [Type].
     */
    private readonly nameToType = new Map<string, Type>();

    /**
     * A list of possible checkers to run against types.
     */
    private readonly checkers: TypeChecker[] = [];

    /**
     * Overloads.
     */
    register(name: string, type: Type): void;
    register(type: Type): void;

    /**
     * Registers [type] using [name] or [Type.representation] for lookup.
     */
    register(arg1: string | Type, arg2?: Type): void {
        if (typeof arg1 === 'string') {
            const existing = this.nameToType.get(arg1);
            if (existing) throw new Error(`Type '${arg1} is already registered.`);
            if (!arg2) throw new Error('Type must be provided.');
            this.nameToType.set(arg1, arg2);
        } else {
            const name = arg1.representation;
            const existing = this.nameToType.get(name);
            if (existing) throw new Error(`Type '${name} is already registered.`);
            this.nameToType.set(name, arg1);
        }
    }

    /**
     * Creates and registers a new type.
     */
    registerNew(
        name: string,
        code?: string,
        baseType: BaseVarType = BaseVarType.INTEGER,
        defaultValue: any = -1,
        builder?: TypeBuilder
    ): Type {
        const options = new MutableOptionsType();
        if (builder) builder(options);

        const newType: Type = {
            representation: name,
            code,
            baseType,
            defaultValue,
            options
        };
        this.register(newType);
        return newType;
    }

    /**
     * Registers all values within [enumMimic] to the name lookup.
     */
    registerAll(enumClass: { ALL: readonly Type[] }): void {
        for (const value of enumClass.ALL) {
            this.register(value);
        }
    }

    /**
     * Searches for [name] and allows changing the [TypeOptions] for the type. If a
     * type wasn't found with the given name an error is thrown.
     */
    changeOptions(name: string, builder: TypeBuilder) {
        const type = this.nameToType.get(name);
        if (!type) throw new Error(`'${name}' was not found.`);
        const options = type.options as MutableOptionsType;
        builder(options);
    }

    /**
     * Finds a type by [name]. If [allowArray] is enabled, names ending with `array`
     * will attempt to find and wrap the type with [ArrayType].
     *
     * If the type doesn't exist an exception is thrown.
     */
    find(name: string, allowArray: boolean = false): Type {
        const type = this.findOrNull(name, allowArray);
        if (!type) throw new Error(`Unable to find type: '${name}'.`);
        return type;
    }

    /**
     * Finds a type by [name]. If [allowArray] is enabled, names ending with `array`
     * will attempt to find and wrap the type with [ArrayType].
     *
     * If the type doesn't exist, `null` is returned.
     */
    findOrNull(name:string, allowArray: boolean = false): Type | null {
        if (allowArray && name.endsWith('array')) {
            const baseName = name.substring(0, name.length - 5);
            const baseType = this.findOrNull(baseName);
            if (!baseType || !baseType.options.allowArray) return null;
            return new ArrayType(baseType);
        }
        return this.nameToType.get(name) ?? null;
    }

    /**
     * Adds [checker] to be called when calling [check].
     *
     * A checker should aim to only do simple checks and avoid covering a wide range of
     * types unless you really know what you're doing.
     *
     * The follow example would allow `namedobj` to be assigned to `obj` but not vice-versa.
     * ```
     * addTypeChecker { left, right -> left == OBJ && right == NAMEDOBJ }
     * ```
     */
    addTypeChecker(checker: TypeChecker) {
        this.checkers.push(checker);
    }

    /**
     * Checks to see if [right] is assignable to [left].
     */
    check(left: Type, right: Type): boolean {
        return this.checkers.some((checker) => checker(left, right));
    }
}