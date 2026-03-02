export interface StrictFeatureLevel {
    /**
     * AUTHENTIC-OVER-TIME:
     * Enables boolean literals and boolean types in scripts.
     * 
     * Default: true
     */
    booleans?: boolean;

    /**
     * AUTHENTIC-OVER-TIME: This was added in 2006.
     * Enables proc declarations and proc calls.
     * Side effect: Enables/disables local variables.
     * 
     * Default: true
     */
    procs?: boolean;

    /**
     * EARLY-AUTHENTIC: This was phased out to be replaced by procs.
     * Enables macro parsing/expansion.
     * 
     * Default: true
     */
    macros?: boolean;

    /**
     * AUTHENTIC-OVER-TIME: This was added in late 2004.
     * Enables enum type usage and the enum command.
     * 
     * Default: true
     */
    enums?: boolean;

    /**
     * AUTHENTIC-OVER-TIME: This was added in 2009.
     * Enables struct type usage and struct_param command.
     * 
     * Default: true
     */
    structs?: boolean;

    /**
     * AUTHENTIC-OVER-TIME: This was added in 2012.
     * Enables dbtable/dbrow/dbcolumn usage and db_find/db_getfield commands.
     * 
     * Default: true
     */
    dbtables?: boolean;

    /**
     * AUTHENTIC-OVER-TIME:
     * Enables logical AND ('&') in conditional expressions.
     * 
     * Default: true
     */
    logicalAnd?: boolean;

    /**
     * AUTHENTIC-OVER-TIME:
     * Enables calc(...) expressions for arithmetic lowering into math commands.
     *
     * Default: true
     */
    calc?: boolean;

    /**
     * AUTHENTIC-OVER-TIME:
     * Enables inclusive relational operators ('<=' and '>=') in conditional expressions.
     * 
     * Default: true
     */
    relationalEquals?: boolean;

    /**
     * UNKNOWN: It's possible players had *-enabled queues and it was only NPCs that did not.
     * Enables typed queue variants (queue*, weakqueue*, strongqueue*, longqueue*).
     * 
     * Default: true
     */
    queueTyped?: boolean;

    /**
     * AUTHENTIC: Still like this.
     * `def_` declarations may not exist in any scope except the top level of a script.
     * 
     * Default: false
     */
    topLevelDefOnly?: boolean;

    /**
     * NOT AUTHENTIC: Not "possible."
     * Allows pointer checking inversion for conditional pointer setters.
     * 
     * Default: true
     */
    pointerInversion?: boolean;
}
