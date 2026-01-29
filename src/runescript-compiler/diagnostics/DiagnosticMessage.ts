/**
 * A class containing different types of diagnostic message texts.
 */
export const DiagnosticMessage = {
    // Internal compiler errors
    UNSUPPORTED_SYMBOLTYPE_TO_TYPE: "Internal compiler error: Unsupported SymbolType -> Type conversion: %s",
    CASE_WITHOUT_SWITCH: "Internal compiler error: Case without switch statement as parent.",
    RETURN_ORPHAN: "Internal compiler error: Orphaned `return` statement, no parent `script` node found.",
    TRIGGER_TYPE_NOT_FOUND: "Internal compiler error: The trigger '%s' has no declaration.",

    // Custom command handler errors
    CUSTOM_HANDLER_NOTYPE: "Internal compiler error: Custom command handler did not assign return type.",
    CUSTOM_HANDLER_NOSYMBOL: "Internal compiler error: Custom command handler did not assign symbol.",

    // Code gen internal compiler errors
    SYMBOL_IS_NULL: "Internal compiler error: Symbol has not been defined for the node.",
    TYPE_HAS_NO_BASETYPE: "Internal compiler error: Type has no defined base type: %s.",
    TYPE_HAS_NO_DEFAULT: "Internal compiler error: Return type '%s' has no defined default value.",
    INVALID_CONDITION: "Internal compiler error: %s is not a supported expression type for conditions.",
    NULL_CONSTANT: "Internal compiler error: %s evaluated to 'null' constant value.",
    EXPRESSION_NO_SUBEXPR: "Internal compiler error: No sub expression node.",

    // Node type agnostic messages
    GENERIC_INVALID_TYPE: "'%s' is not a valid type.",
    GENERIC_TYPE_MISMATCH: "Type mismatch: '%s' was given but '%s' was expected.",
    GENERIC_UNRESOLVED_SYMBOL: "'%s' could not be resolved to a symbol.",
    ARITHMETIC_INVALID_TYPE: "Type mismatch: '%s' was given but 'int' or 'long' was expected.",

    // Script node specific
    SCRIPT_REDECLARATION: "[%s,%s] is already defined.",
    SCRIPT_LOCAL_REDECLARATION: "'$%s' is already defined.",
    SCRIPT_TRIGGER_INVALID: "'%s' is not a valid trigger type.",
    SCRIPT_COMMAND_ONLY: "Using a '*' is only allowed for commands.",
    SCRIPT_TRIGGER_NO_PARAMETERS: "The trigger type '%s' is not allowed to have parameters defined.",
    SCRIPT_TRIGGER_EXPECTED_PARAMETERS: "The trigger type '%s' is expected to accept (%s).",
    SCRIPT_TRIGGER_NO_RETURNS: "The trigger type '%s' is not allowed to return values.",
    SCRIPT_TRIGGER_EXPECTED_RETURNS: "The trigger type '%s' is expected to return (%s).",
    SCRIPT_SUBJECT_ONLY_GLOBAL: "Trigger '%s' only allows global subjects.",
    SCRIPT_SUBJECT_NO_GLOBAL: "Trigger '%s' does not allow global subjects.",
    SCRIPT_SUBJECT_NO_CAT: "Trigger '%s' does not allow category subjects.",

    // Switch statement node specific
    SWITCH_INVALID_TYPE: "'%s' is not allowed within a switch statement.",
    SWITCH_DUPLICATE_DEFAULT: "Duplicate default label.",
    SWITCH_CASE_NOT_CONSTANT: "Switch case value is not a constant expression.",

    // Assignment statement node specific
    ASSIGN_MULTI_ARRAY: "Arrays are not allowed in multi-assignment statements.",

    // Condition expression specific
    CONDITION_INVALID_NODE_TYPE: "Conditions are only allowed to be binary expressions.",

    // Binary expression specific
    BINOP_INVALID_TYPES: "Operator '%s' cannot be applied to '%s', '%s'.",
    BINOP_TUPLE_TYPE: "%s side of binary expressions can only have one type but has '%s'.",

    // Call expression specific
    COMMAND_REFERENCE_UNRESOLVED: "'%s' cannot be resolved to a command.",
    COMMAND_NOARGS_EXPECTED: "'%s' is expected to have no arguments but has '%s'.",
    PROC_REFERENCE_UNRESOLVED: "'~%s' cannot be resolved to a proc.",
    PROC_NOARGS_EXPECTED: "'~%s' is expected to have no arguments but has '%s'.",
    JUMP_REFERENCE_UNRESOLVED: "'@%s' cannot be resolved to a label.",
    JUMP_NOARGS_EXPECTED: "'@%s' is expected to have no arguments but has '%s'.",
    CLIENTSCRIPT_REFERENCE_UNRESOLVED: "'%s' cannot be resolved to a clientscript.",
    CLIENTSCRIPT_NOARGS_EXPECTED: "'%s' is expected to have no arguments but has '%s'.",
    HOOK_TRANSMIT_LIST_UNEXPECTED: "Unexpected hook transmit list.",

    // Local variable specific
    LOCAL_DECLARATION_INVALID_TYPE: "'%s' is not allowed to be declared as a type.",
    LOCAL_REFERENCE_UNRESOLVED: "'$%s' cannot be resolved to a local variable.",
    LOCAL_REFERENCE_NOT_ARRAY: "Access of indexed value of non-array type variable '$%s'.",
    LOCAL_ARRAY_INVALID_TYPE: "'%s' is not allowed to be used as an array.",
    LOCAL_ARRAY_REFERENCE_NOINDEX: "'$%s' is a reference to an array variable without specifying the index.",

    // Game var specific
    GAME_REFERENCE_UNRESOLVED: "'%%%s' cannot be resolved to a game variable.",

    // Constant variable specific
    CONSTANT_REFERENCE_UNRESOLVED: "'^%s' cannot be resolved to a constant.",
    CONSTANT_CYCLIC_REF: "Cyclic constant references are not permitted: %s.",
    CONSTANT_UNKNOWN_TYPE: "Unable to infer type for '^%s'.",
    CONSTANT_PARSE_ERROR: "Unable to parse constant value of '%s' into type '%s'.",
    CONSTANT_NONCONSTANT: "Constant value of '%s' evaluated to a non-constant expression.",

    // Pointer checking specific
    POINTER_UNINITIALIZED: "Attempt to access uninitialized pointer %s.",
    POINTER_CORRUPTED: "Attempt to access corrupted pointer %s.",
    POINTER_CORRUPTED_LOC: "%s corrupted here.",
    POINTER_REQUIRED_LOC: "%s required here.",
} as const;
