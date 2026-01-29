import { Type as ScriptType } from "../type/Type";

/**
 * Determines how a script subject is validated.
 */
export type SubjectMode =
/**
 * A subject mode that only allows global (`_`) scripts.
 */
| { kind: 'None'}
/**
 * A subject mode specifies the subject as just part of the script name and is
 * not a reference to a symbol.
 */
| { kind: 'Name' }
/**
 * A subject mode that specifies the subject is a `Type` of some sort.
 */
| { kind: 'Type'; type: ScriptType; category?: boolean; global?: boolean };