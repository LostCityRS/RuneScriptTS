import { BaseVarType } from './BaseVarType';
import { Type } from './Type';
import { MutableOptionsType as MutableTypeOptions, TypeOptions } from './TypeOptions';

/**
 * The main types used in the compiler.
 *
 * These types are the ones that are expected to exist to use the compiler.
 * There are other types the compiler will reference dynamically, but those
 * types are counted as optional and will error if they are not defined when
 * trying to access them.
 */

type TypeBuilder = (opts: MutableTypeOptions) => void;

export class PrimitiveType extends Type {
    readonly representation: string;
    readonly options: TypeOptions;

    /**
     * A [PrimitiveType] type that only defines the [baseType] and [defaultValue].
     */
    private constructor(
        name: string,
        public readonly code: string | undefined,
        public readonly baseType: BaseVarType,
        public readonly defaultValue: unknown,
        builder?: TypeBuilder
    ) {
        super();
        this.representation = name.toLowerCase();

        const opts = new MutableTypeOptions();
        builder?.(opts);
        this.options = opts;
    }

    /**
     * Instances
     */
    static readonly INT = new PrimitiveType("INT", "i", BaseVarType.INTEGER, 0);
    static readonly BOOLEAN = new PrimitiveType("BOOLEAN", "1", BaseVarType.INTEGER, 0);
    static readonly COORD = new PrimitiveType("COORD", "c", BaseVarType.INTEGER, -1);
    static readonly STRING = new PrimitiveType("STRING", "s", BaseVarType.STRING, "", opts => { opts.allowArray = false; opts.allowSwitch = false; });
    static readonly CHAR = new PrimitiveType("CHAR", "z", BaseVarType.INTEGER, -1);
    static readonly LONG = new PrimitiveType("LONG", "Ï", BaseVarType.LONG, -1, opts => { opts.allowArray = false, opts.allowSwitch = false});
    static readonly MAPZONE = new PrimitiveType("MAPZONE", "0", BaseVarType.INTEGER, -1);

    /**
     * Utilities
     */
    static readonly ALL: readonly PrimitiveType[] = [
        PrimitiveType.INT,
        PrimitiveType.BOOLEAN,
        PrimitiveType.COORD,
        PrimitiveType.STRING,
        PrimitiveType.CHAR,
        PrimitiveType.LONG,
        PrimitiveType.MAPZONE
    ]

    static byRepresentation(rep: string): PrimitiveType | undefined {
        return PrimitiveType.ALL.find(t => t.representation === rep);
    }
}