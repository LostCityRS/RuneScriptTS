import { Opcode } from "../../runescript-compiler/codegen/Opcode";
import { Block } from "../../runescript-compiler/codegen/script/Block";
import { Label } from "../../runescript-compiler/codegen/script/Label";
import { RuneScript } from "../../runescript-compiler/codegen/script/RuneScript";
import { SwitchTable } from "../../runescript-compiler/codegen/script/SwitchTable";
import { ScriptSymbol } from "../../runescript-compiler/symbol/ScriptSymbol";
import { BasicSymbol, LocalVariableSymbol, RuneScriptSymbol } from "../../runescript-compiler/symbol/Symbol";
import { SubjectMode } from "../../runescript-compiler/trigger/SubjectMode";
import { BaseVarType } from "../../runescript-compiler/type/BaseVarType";
import { MetaType } from "../../runescript-compiler/type/MetaType";
import { PrimitiveType } from "../../runescript-compiler/type/PrimitiveType";
import { ArrayType } from "../../runescript-compiler/type/wrapped/ArrayType";
import { VarBitType, VarNpcType, VarPlayerType, VarSharedType } from "../../runescript-compiler/type/wrapped/GameVarType";
import { BaseScriptWriter, IdProvider } from "../../runescript-compiler/writer/BaseScriptWriter";
import { ServerScriptOpcode } from "../ServerScriptOpcode";
import { ScriptVarType } from "../type/ScriptVarType";
import { BinaryScriptWriterContext } from "./BinaryScriptWriterContext";

/**
 * A `ScriptWriter` implementation that writes to a [ByteBuf]. Implementations
 * must override [outputScript] to handle the binary output for each script.
 */
export abstract class BinaryScriptWriter extends BaseScriptWriter<BinaryScriptWriterContext> {
    constructor(idProvider: IdProvider) {
        super(idProvider);
    }
    
    /**
     * Handles the binary output of [script] where [data] is the script in a binary format.
     *
     * The `data` buffer is released automatically after the call to this function.
     */
    abstract outputScript(script: RuneScript, data: Buffer): void;

    protected override finishWrite(script: RuneScript, context: BinaryScriptWriterContext): void {
        const buffer = context.finish();
        try {
            this.outputScript(script, buffer);
        } finally {
            // NO-OP, Node.js handles release automatically.
        }
    }

    protected override createContext(script: RuneScript): BinaryScriptWriterContext {
        const lookupKey = this.generateLookupKey(script);
        return new BinaryScriptWriterContext(script, lookupKey);
    }

    private generateLookupKey(script: RuneScript): number {
        const trigger = script.trigger;
        const subjectMode = script.trigger.subjectMode;
        const subject = script.subjectReference;

        // Special case for no name.
        if (subjectMode === SubjectMode.Name) {
            return -1;
        }

        let lookupKey = trigger.id;

        if ('type' in subjectMode && subject != null) {
            const subjectType = subject.type;
            let subjectId: number;

            if (subject.type === PrimitiveType.MAPZONE || subject.type === PrimitiveType.COORD) {
                subjectId = parseInt(subject.name, 10);
            } else {
                subjectId = this.idProvider.get(subject);
            }

            const type = subjectType === ScriptVarType.CATEGORY ? 1 : 2;
            lookupKey += (type << 8) | (subjectId << 10);
        }

        return lookupKey;
    }

    protected override enterBlock(context: BinaryScriptWriterContext, block: Block): void {
        // NO-OP
    }

    protected override writePushConstantInt(context: BinaryScriptWriterContext, value: number): void {
        context.instruction(ServerScriptOpcode.PUSH_CONSTANT_INT, value);
    }

    protected override writePushConstantString(context: BinaryScriptWriterContext, value: string): void {
        context.instructionString(ServerScriptOpcode.PUSH_CONSTANT_STRING, value);
    }

    protected override writePushConstantLong(context: BinaryScriptWriterContext, value: bigint): void {
        throw new Error("Not supported.");
    }

    protected override writePushConstantSymbol(context: BinaryScriptWriterContext, value: RuneScriptSymbol): void {
        let id: number;

        if (value instanceof LocalVariableSymbol) {
            id = BaseScriptWriter.getVariableId(context.script.locals, value);
        } else if (value instanceof BasicSymbol && value.type instanceof MetaType.Type) {
            const type = value.type;
            if (type.inner.code?.charCodeAt[0] != null) {
                id = type.inner.code?.charCodeAt[0];
            } else {
                throw new Error(`Type has chno code: ${type.inner}.`);
            }
        } else {
            id = this.idProvider.get(value);
        }

        context.instruction(ServerScriptOpcode.PUSH_CONSTANT_INT, id);
    }

    protected override writePushLocalVar(context: BinaryScriptWriterContext, symbol: LocalVariableSymbol): void {
        const id = BaseScriptWriter.getVariableId(context.script.locals, symbol);

        let op: ServerScriptOpcode;
        if (symbol.type instanceof ArrayType) {
            op = ServerScriptOpcode.PUSH_ARRAY_INT;
        } else if (symbol.type.baseType === BaseVarType.STRING) {
            op = ServerScriptOpcode.PUSH_STRING_LOCAL;
        } else if (symbol.type.baseType === BaseVarType.INTEGER) {
            op = ServerScriptOpcode.POP_INT_LOCAL;
        } else {
            throw new Error(`Unsupported local variable type: ${symbol.type}.`);
        }

        context.instruction(op, id);
    }

    protected override writePopLocalVar(context: BinaryScriptWriterContext, symbol: LocalVariableSymbol): void {
        const id = BaseScriptWriter.getVariableId(context.script.locals, symbol);

        let op: ServerScriptOpcode;
        if (symbol.type instanceof ArrayType) {
            op = ServerScriptOpcode.POP_ARRAY_INT;
        } else if (symbol.type.baseType === BaseVarType.STRING) {
            op = ServerScriptOpcode.POP_STRING_LOCAL;
        } else if (symbol.type.baseType === BaseVarType.INTEGER) {
            op = ServerScriptOpcode.POP_INT_LOCAL;
        } else {
            throw new Error(`Unsupported local variable type: ${symbol.type}.`);
        }

        context.instruction(op, id);
    }

    protected override writePushVar(context: BinaryScriptWriterContext, symbol: BasicSymbol, dot: boolean): void {
        const id = this.idProvider.get(symbol);

        let opcode: ServerScriptOpcode;
        if (symbol.type instanceof VarPlayerType) {
            opcode = ServerScriptOpcode.PUSH_VARP;
        } else if (symbol.type instanceof VarBitType) {
            opcode = ServerScriptOpcode.PUSH_VARBIT;
        } else if (symbol.type instanceof VarNpcType) {
            opcode = ServerScriptOpcode.PUSH_VARN;
        } else if (symbol.type instanceof VarSharedType) {
            opcode = ServerScriptOpcode.PUSH_VARS;
        } else {
            throw new Error(`Unsupported variable type: ${symbol.type}.`);
        }

        let operand = id;
        if (dot) {
            operand += 1 << 16;
        }

        context.instruction(opcode, operand);
    }

    protected override writePopVar(context: BinaryScriptWriterContext, symbol: BasicSymbol, dot: boolean): void {
        const id = this.idProvider.get(symbol);

        let opcode: ServerScriptOpcode;
        if (symbol.type instanceof VarPlayerType) {
            opcode = ServerScriptOpcode.POP_VARP;
        } else if (symbol.type instanceof VarBitType) {
            opcode = ServerScriptOpcode.POP_VARBIT;
        } else if (symbol.type instanceof VarNpcType) {
            opcode = ServerScriptOpcode.POP_VARN;
        } else if (symbol.type instanceof VarSharedType) {
            opcode = ServerScriptOpcode.POP_VARS;
        } else {
            throw new Error(`Unsupported variable typ: ${symbol.type}.`);
        }

        let operand = id;
        if (dot) {
            operand += 1 << 16;
        }

        context.instruction(opcode, operand);
    }

    protected override writeDefineArray(context: BinaryScriptWriterContext, symbol: LocalVariableSymbol): void {
        const id = BaseScriptWriter.getVariableId(context.script.locals, symbol);

        const arrayType = symbol.type as ArrayType;
        if (!arrayType.inner.code.charCodeAt[0]) {
            throw new Error(`Type has no char code: ${symbol.type}.`);
        }

        const code = arrayType.inner.code.charCodeAt[0];
        context.instruction(ServerScriptOpcode.DEFINE_ARRAY, (id << 16) | code);
    }

    protected override writeSwitch(context: BinaryScriptWriterContext, switchTable: SwitchTable): void {
        context.switch(switchTable.id, () => {
            let totalKeyCount = 0;

            for (const switchCase of switchTable.cases.entries()) {
                const jumpLocation = context.jumpTable.get(switchCase[1].label);
                if (jumpLocation === undefined) {
                    throw new Error(`Label not found: ${switchCase[1].label}.`);
                }

                const relativeJumpLocation = jumpLocation - context.curIndex - 1;

                for (const key of switchCase[1].keys) {
                    context.switchCase(this.findCaseKeyValue(key), relativeJumpLocation);
                }

                totalKeyCount += switchCase[1].keys.length;
            }

            return totalKeyCount;
        });
    }

    private findCaseKeyValue(key: number | RuneScriptSymbol): number {
        if (typeof key === "number") {
            return key;
        } else if (key instanceof Symbol) {
            return this.idProvider.get(key);
        } else {
            throw new Error(`Unsupport key type: ${key}.`);
        }
    }

    protected override writeBranch(context: BinaryScriptWriterContext, opcode: Opcode<any>, label: Label): void {
        let op: ServerScriptOpcode;

        switch (opcode) {
            case Opcode.Branch:
                op = ServerScriptOpcode.BRANCH;
                break;
            case Opcode.BranchNot:
                op = ServerScriptOpcode.BRANCH_NOT;
                break;
            case Opcode.BranchEquals:
                op = ServerScriptOpcode.BRANCH_EQUALS;
                break;
            case Opcode.BranchLessThan:
                op = ServerScriptOpcode.BRANCH_LESS_THAN;
                break;
            case Opcode.BranchGreaterThan:
                op = ServerScriptOpcode.BRANCH_GREATER_THAN;
                break;
            case Opcode.BranchLessThanOrEquals:
                op = ServerScriptOpcode.BRANCH_LESS_THAN_OR_EQUALS;
                break;
            case Opcode.BranchGreaterThanOrEquals:
                op = ServerScriptOpcode.BRANCH_GREATER_THAN_OR_EQUALS;
                break;
            default:
                throw new Error(`Unsupported opcode: ${opcode}.`);
        }

        const jumpLocation = context.jumpTable.get(label);
        if (jumpLocation === undefined) {
            throw new Error(`Label not found: ${label}.`);
        }

        context.instruction(op, jumpLocation - context.curIndex - 1);
    }

    protected override writeJoinString(context: BinaryScriptWriterContext, count: number): void {
        context.instruction(ServerScriptOpcode.JOIN_STRING, count);
    }

    protected override writeDiscard(context: BinaryScriptWriterContext, baseType: BaseVarType): void {
        let op: ServerScriptOpcode;

        switch (baseType) {
            case BaseVarType.INTEGER:
                op = ServerScriptOpcode.POP_INT_DISCARD;
                break;
            case BaseVarType.STRING:
                op = ServerScriptOpcode.POP_STRING_DISCARD;
                break;
            default:
                throw new Error(`Unsupported base type: ${baseType}.`);
        }

        context.instruction(op, 0);
    }

    protected override writeGosub(context: BinaryScriptWriterContext, symbol: ScriptSymbol): void {
        const id = this.idProvider.get(symbol);
        context.instruction(ServerScriptOpcode.GOSUB_WITH_PARAMS, id);
    }

    protected override writeJump(context: BinaryScriptWriterContext, symbol: ScriptSymbol): void {
        const op = this.idProvider.get(symbol);
        const secondary: boolean = symbol.name.startsWith(".");
        context.instructionRaw(op, secondary ? 1 : 0);
    }

    protected override writeCommand(context: BinaryScriptWriterContext, symbol: ScriptSymbol): void {
        const op = this.idProvider.get(symbol);
        const secondary = symbol.name.startsWith(".");
        context.instructionRaw(op, secondary ? 1 : 0);
    }

    protected override writeReturn(context: BinaryScriptWriterContext): void {
        context.instruction(ServerScriptOpcode.RETURN, 0);
    }

    protected override writeMath(context: BinaryScriptWriterContext, opcode: Opcode<any>): void {
        let op: ServerScriptOpcode;

        switch (opcode) {
            case Opcode.Add:
                op = ServerScriptOpcode.ADD;
                break;
            case Opcode.Sub:
                op = ServerScriptOpcode.SUB;
                break;
            case Opcode.Multiply:
                op = ServerScriptOpcode.MULTIPLY;
                break;
            case Opcode.Divide:
                op = ServerScriptOpcode.DIVIDE;
                break;
            case Opcode.Modulo:
                op = ServerScriptOpcode.MODULO;
                break;
            case Opcode.Or:
                op = ServerScriptOpcode.OR;
                break;
            case Opcode.And:
                op = ServerScriptOpcode.AND;
                break;
            default:
                throw new Error(`Unsupported math opcode: ${opcode}`);
        }

        context.instruction(op, 0);
    }
}

export const MetaTypeType = MetaType.Type;