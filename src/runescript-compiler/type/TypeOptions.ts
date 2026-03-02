/**
 * Defines options to enable or disable features for a specific [Type].
 */
export interface TypeOptions {
    /**
     * Whether the type is allowed to be used within a switch statement.
     *
     * Default: `true`
     */
    readonly allowSwitch: boolean;

    /**
     * Whether the type is allowed to be used in an array.
     *
     * Default: `true`
     */
    readonly allowArray: boolean;

    /**
     * Whether the type is allowed to be declared as a local variable.
     *
     * Default: `true`
     */
    readonly allowDeclaration: boolean;

    /**
     * Whether the type is allowed to be declared as a script parameter.
     *
     * Default: `true`
     */
    readonly allowParameter?: boolean;
}

/**
 * Implementation of [TypeOptions] with the properties mutable.
 */
export class MutableOptionsType implements TypeOptions {
    allowSwitch = true;
    allowArray = true;
    allowDeclaration = true;
    allowParameter = true;

    constructor(init?: Partial<TypeOptions>) {
        if (init) {
            Object.assign(this, init);
        }
    }
}
