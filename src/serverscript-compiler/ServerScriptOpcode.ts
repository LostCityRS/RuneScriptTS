/**
 * An enumeration of opcode names with their id and how the operand is written in binary.
 *
 * This only contains the opcode and no information about the signatures of commands.
 */
export class ServerScriptOpcode {
    private constructor(
        public readonly id: number,
        public readonly largeOperand: boolean = false
    ) {}

    // Core language ops (0-99)
    static readonly PUSH_CONSTANT_INT = new ServerScriptOpcode(0, true);
    static readonly PUSH_VARP = new ServerScriptOpcode(1, true);
    static readonly POP_VARP = new ServerScriptOpcode(2, true);
    static readonly PUSH_CONSTANT_STRING = new ServerScriptOpcode(3, true);
    static readonly PUSH_VARN = new ServerScriptOpcode(4, true);
    static readonly POP_VARN = new ServerScriptOpcode(5, true);
    static readonly BRANCH = new ServerScriptOpcode(6, true);
    static readonly BRANCH_NOT = new ServerScriptOpcode(7, true);
    static readonly BRANCH_EQUALS = new ServerScriptOpcode(8, true);
    static readonly BRANCH_LESS_THAN = new ServerScriptOpcode(9, true);
    static readonly BRANCH_GREATER_THAN = new ServerScriptOpcode(10, true);
    static readonly PUSH_VARS = new ServerScriptOpcode(11, true);
    static readonly POP_VARS = new ServerScriptOpcode(12, true);
    static readonly RETURN = new ServerScriptOpcode(21);
    static readonly GOSUB = new ServerScriptOpcode(22);
    static readonly JUMP = new ServerScriptOpcode(23);
    static readonly SWITCH = new ServerScriptOpcode(24, true);
    static readonly PUSH_VARBIT = new ServerScriptOpcode(25, true);
    static readonly POP_VARBIT = new ServerScriptOpcode(27, true);
    static readonly BRANCH_LESS_THAN_OR_EQUALS = new ServerScriptOpcode(31, true);
    static readonly BRANCH_GREATER_THAN_OR_EQUALS = new ServerScriptOpcode(32, true);
    static readonly PUSH_INT_LOCAL = new ServerScriptOpcode(33, true);
    static readonly POP_INT_LOCAL = new ServerScriptOpcode(34, true);
    static readonly PUSH_STRING_LOCAL = new ServerScriptOpcode(35, true);
    static readonly POP_STRING_LOCAL = new ServerScriptOpcode(36, true);
    static readonly JOIN_STRING = new ServerScriptOpcode(37, true);
    static readonly POP_INT_DISCARD = new ServerScriptOpcode(38);
    static readonly POP_STRING_DISCARD = new ServerScriptOpcode(39);
    static readonly GOSUB_WITH_PARAMS = new ServerScriptOpcode(40, true);
    static readonly JUMP_WITH_PARAMS = new ServerScriptOpcode(41, true);
    static readonly DEFINE_ARRAY = new ServerScriptOpcode(44, true);
    static readonly PUSH_ARRAY_INT = new ServerScriptOpcode(45, true);
    static readonly POP_ARRAY_INT = new ServerScriptOpcode(46, true);

    // Number ops (4600-4699)
    static readonly ADD = new ServerScriptOpcode(4600);
    static readonly SUB = new ServerScriptOpcode(4601);
    static readonly MULTIPLY = new ServerScriptOpcode(4602);
    static readonly DIVIDE = new ServerScriptOpcode(4603);
    static readonly MODULO = new ServerScriptOpcode(4611);
    static readonly AND = new ServerScriptOpcode(4614);
    static readonly OR = new ServerScriptOpcode(4615);

    static readonly ALL: readonly ServerScriptOpcode[] = [
        ServerScriptOpcode.PUSH_CONSTANT_INT,
        ServerScriptOpcode.PUSH_VARP,
        ServerScriptOpcode.POP_VARP,
        ServerScriptOpcode.PUSH_CONSTANT_STRING,
        ServerScriptOpcode.PUSH_VARN,
        ServerScriptOpcode.POP_VARN,
        ServerScriptOpcode.BRANCH,
        ServerScriptOpcode.BRANCH_NOT,
        ServerScriptOpcode.BRANCH_EQUALS,
        ServerScriptOpcode.BRANCH_LESS_THAN,
        ServerScriptOpcode.BRANCH_GREATER_THAN,
        ServerScriptOpcode.PUSH_VARS,
        ServerScriptOpcode.POP_VARS,
        ServerScriptOpcode.RETURN,
        ServerScriptOpcode.GOSUB,
        ServerScriptOpcode.JUMP,
        ServerScriptOpcode.SWITCH,
        ServerScriptOpcode.PUSH_VARBIT,
        ServerScriptOpcode.POP_VARBIT,
        ServerScriptOpcode.BRANCH_LESS_THAN_OR_EQUALS,
        ServerScriptOpcode.BRANCH_GREATER_THAN_OR_EQUALS,
        ServerScriptOpcode.PUSH_INT_LOCAL,
        ServerScriptOpcode.POP_INT_LOCAL,
        ServerScriptOpcode.PUSH_STRING_LOCAL,
        ServerScriptOpcode.POP_STRING_LOCAL,
        ServerScriptOpcode.JOIN_STRING,
        ServerScriptOpcode.POP_INT_DISCARD,
        ServerScriptOpcode.POP_STRING_DISCARD,
        ServerScriptOpcode.GOSUB_WITH_PARAMS,
        ServerScriptOpcode.JUMP_WITH_PARAMS,
        ServerScriptOpcode.DEFINE_ARRAY,
        ServerScriptOpcode.PUSH_ARRAY_INT,
        ServerScriptOpcode.POP_ARRAY_INT,
        ServerScriptOpcode.ADD,
        ServerScriptOpcode.SUB,
        ServerScriptOpcode.MULTIPLY,
        ServerScriptOpcode.DIVIDE,
        ServerScriptOpcode.MODULO,
        ServerScriptOpcode.AND,
        ServerScriptOpcode.OR
    ];
}
