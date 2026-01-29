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
     * Whether the type is allowed to be declared as a parameter or local variable.
     *
     * Default: `true`
     */
    readonly allowDeclaration: boolean;
}


/**
 * Implementation of [TypeOptions] with the properties mutable.
 */
export class MutableOptionsType implements TypeOptions {
    allowSwitch = true;
    allowArray = true;
    allowDeclaration = true;

    constructor(init?: Partial<TypeOptions>) {
        if (init) {
            Object.assign(this, init);
        }
    }
}