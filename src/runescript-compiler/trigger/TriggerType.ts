import { PointerType } from '../pointer/PointerType';
import { Type } from '../type/Type';
import { SubjectMode } from './SubjectMode';

/**
 * A trigger type of a script. The trigger type is the first part of a script declaration (`[trigger,_]`) where
 * each trigger has different functionality and uses.
 */
export interface TriggerType {
    /**
     * A unique number to identify the trigger.
     */
    id: number;

    /**
     * The text that represents the trigger. This is the string that is used to identifier the trigger when defining a
     * script.
     *
     * ```
     * [<identifier>,<subject>]
     * ```
     */
    identifier: string;

    /**
     * The [SubjectMode] for the trigger.
     */
    subjectMode: SubjectMode;

    /**
     * Whether parameters are allowed in scripts using the trigger.
     */
    allowParameters: boolean;

    /**
     * The parameters that must be defined. If `null` no arguments are expected.
     */
    parameters: Type;

    /**
     * Whether returns are allowed in scripts using the trigger.
     */
    allowReturns: boolean;

    /**
     * The return types that must be defined. If `null` no returns are expected.
     */
    returns: Type | null;

    /**
     * The pointers that the trigger has by default.
     */
    pointers: Set<PointerType> | null;
}