import { TriggerType } from '../trigger/TriggerType';
import { BaseVarType } from './BaseVarType';
import { Type as MainType } from './Type';
import { MutableOptionsType, TypeOptions } from './TypeOptions';
import { WrappedType } from './wrapped/WrappedType';

/**
 * A class of types used internally in the compiler.
 */
export class MetaType implements MainType {
    readonly representation: string;
    readonly baseType: BaseVarType = BaseVarType.INTEGER;
    readonly defaultValue: unknown = -1;
    readonly options: TypeOptions = new MutableOptionsType({ allowSwitch: false, allowArray: false, allowDeclaration: false});

    private constructor(private readonly name: string) {
        this.representation = name.toLowerCase();
    }

    public get code(): string {
        throw new Error("MetaType has no character representation.");
    }

    /**
     * A type that is comparable to all other types. This is different to
     * [Error] as it is not meant for expressions that had an error during
     * type checking, and is intended for more complex signatures that need
     * to define a placeholder type that allows anything.
     *
     * Example: `MetaType.Type(MetaType.Any)`
     */
    static readonly Any = new MetaType("any");

    /**
     * A type that says that nothing is returned. This is intended to be used
     * for `error`-like and `jump`-like commands that will not continue
     * execution in the script that called it. This type should not be exposed
     * to scripts directly except for `command` declarations.
     *
     * See Also: [Bottom type](https://en.wikipedia.org/wiki/Bottom_type)
     */
    static readonly Nothing = new MetaType("nothing");

    /**
     * A type used to specify the type resolution resulted into an error. This
     * type is comparable to **all** other types to prevent error propagation.
     */
    static readonly Error = new MetaType("error");

    /**
     * A type that signifies that nothing is returned.
     */
    static readonly Unit = new MetaType("unit");

    /**
     * A special type used when referencing other types.
     */
    static Type = class extends MetaType implements WrappedType {
        readonly inner: MainType;
        readonly representation: string;

        constructor(inner: MainType) {
            super("type");
            this.inner = inner;
            this.representation = `type<${inner.representation}>`;
        }
    };

    /**
     * A special type that refers to some sort of script. The type includes the
     * script trigger type, parameter type(s), and return type(s).
     */
    static Script = class extends MetaType {
        readonly representation: string;
        readonly trigger: TriggerType;
        readonly parameterType: MainType;
        readonly returnType: MainType;

        constructor(trigger: TriggerType, parameterType: MainType, returnType: MainType) {
            super("script");
            this.trigger = trigger;
            this.parameterType = parameterType;
            this.returnType = returnType;
            this.representation = trigger.identifier;
        }
    };

    /**
     * A special type used when referencing a script with a trigger type of `clientscript`.
     * The [transmitListType] is the type allowed in the transmit list, if transmit list isn't expected,
     * use [Unit].
     */
    static Hook = class extends MetaType{
        readonly transmitListType: MainType;
        readonly representation: string;

        constructor(transmitListType: MainType) {
            super("hook");
            this.transmitListType = transmitListType;
            this.representation = `hook<${transmitListType.representation}>`;
        }
    }
}