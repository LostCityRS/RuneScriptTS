import { PointerType } from './PointerType';

/**
 * Contains sets of [PointerType]s used to mark which pointers are required, set,
 * or corrupted by the script or command.
 *
 * @property required The required pointer types to invoke.
 * @property set The pointer types that will be set after invoking.
 * @property conditionalSet When `true`, [set] will only be used when used in a condition.
 * @property corrupted The pointer types that will be corrupted when invoking.
 */
export interface PointerHolder {
    required: Set<PointerType>;
    set: Set<PointerType>;
    conditionalSet: boolean;
    corrupted: Set<PointerType>;
}