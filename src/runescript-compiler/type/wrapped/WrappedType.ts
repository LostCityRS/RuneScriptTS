import { Type } from '#/runescript-compiler/type/Type.js';

/**
 * A type that contains an inner type. This is intended for more complex types
 * that resolve to a different type depending on how they're accessed. This is
 * necessary for some cases where you want to verify a reference is of a type
 * without seeing what the "execution" type would be.
 *
 * @see ArrayType
 */
export abstract class WrappedType extends Type {
    /**
     * The inner type that is being wrapped.
     */
    readonly inner: Type;
}
