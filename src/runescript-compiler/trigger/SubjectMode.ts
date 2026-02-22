import { Type as ScriptType } from '#/runescript-compiler/type/Type.js';

/**
 * Determines how a script subject is validated.
 */
export abstract class SubjectMode {
    private constructor() {}

    /**
     * A subject mode that only allows global (`_`) scripts.
     */
    public static readonly None = new (class extends SubjectMode {})();

    /**
     * A subject mode specifies the subject as just part of the script name and is
     * not a reference to a symbol.
     */
    public static readonly Name = new (class extends SubjectMode {})();

    /**
     * A subject mode that specifies the subject is a `Type` of some sort.
     */
    public static Type(type: ScriptType, category = true, global = true) {
        return new (class extends SubjectMode {
            public readonly type = type;
            public readonly category = category;
            public readonly global = global;
        })();
    }
}
