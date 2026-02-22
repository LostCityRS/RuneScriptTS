import { Instruction } from '#/runescript-compiler/codegen/Instruction.js';
import { Opcode } from '#/runescript-compiler/codegen/Opcode.js';
import { Block } from '#/runescript-compiler/codegen/script/Block.js';
import { Label } from '#/runescript-compiler/codegen/script/Label.js';
import { LocalTable, RuneScript } from '#/runescript-compiler/codegen/script/RuneScript.js';
import { SwitchTable } from '#/runescript-compiler/codegen/script/SwitchTable.js';
import { ScriptSymbol } from '#/runescript-compiler/symbol/ScriptSymbol.js';
import { BasicSymbol, LocalVariableSymbol, RuneScriptSymbol } from '#/runescript-compiler/symbol/Symbol.js';
import { BaseVarType } from '#/runescript-compiler/type/BaseVarType.js';
import { ArrayType } from '#/runescript-compiler/type/wrapped/ArrayType.js';
import { ScriptWriter } from '#/runescript-compiler/writer/ScriptWriter.js';

/**
 * A basic implementation of [ScriptWriter] with some utility functions for writing
 * a script.
 */
export abstract class BaseScriptWriter<T extends BaseScriptWriterContext> implements ScriptWriter {
    constructor(public readonly idProvider: IdProvider) {}

    write(script: RuneScript): void {
        const context = this.createContext(script);

        for (const block of script.blocks) {
            this.enterBlock(context, block);
            for (const instruction of block.instructions) {
                // Write the current instruction
                this.writeInstruction(context, instruction);

                // Update current instruction index
                context.curIndex++;
            }
        }
        this.finishWrite(script, context);
    }

    /**
     * Creates a new context that is passed to each opcode writer.
     */
    protected abstract createContext(script: RuneScript): T;

    protected abstract finishWrite(script: RuneScript, context: T): void;

    close(): void {
        // NO-OP
    }

    /**
     * Opcode specific write functions
     */
    private writeInstruction(context: T, instruction: Instruction<any>): void {
        const { opcode, operand } = instruction;
        switch (opcode) {
            case Opcode.PushConstantInt:
                this.writePushConstantInt(context, operand as number);
                break;
            case Opcode.PushConstantString:
                this.writePushConstantString(context, operand as string);
                break;
            case Opcode.PushConstantLong:
                this.writePushConstantLong(context, operand as bigint);
                break;
            case Opcode.PushConstantSymbol:
                this.writePushConstantSymbol(context, operand as RuneScriptSymbol);
                break;
            case Opcode.PushLocalVar:
                this.writePushLocalVar(context, operand as LocalVariableSymbol);
                break;
            case Opcode.PopLocalVar:
                this.writePopLocalVar(context, operand as LocalVariableSymbol);
                break;
            case Opcode.PushVar:
                this.writePushVar(context, operand as BasicSymbol, false);
                break;
            case Opcode.PushVar2:
                this.writePushVar(context, operand as BasicSymbol, true);
                break;
            case Opcode.PopVar:
                this.writePopVar(context, operand as BasicSymbol, false);
                break;
            case Opcode.PopVar2:
                this.writePopVar(context, operand as BasicSymbol, true);
                break;
            case Opcode.DefineArray:
                this.writeDefineArray(context, operand as LocalVariableSymbol);
                break;
            case Opcode.Switch:
                this.writeSwitch(context, operand as SwitchTable);
                break;
            case Opcode.Branch:
            case Opcode.BranchNot:
            case Opcode.BranchEquals:
            case Opcode.BranchLessThan:
            case Opcode.BranchGreaterThan:
            case Opcode.BranchLessThanOrEquals:
            case Opcode.BranchGreaterThanOrEquals:
            case Opcode.LongBranchNot:
            case Opcode.LongBranchEquals:
            case Opcode.LongBranchLessThan:
            case Opcode.LongBranchGreaterThan:
            case Opcode.LongBranchLessThanOrEquals:
            case Opcode.LongBranchGreaterThanOrEquals:
            case Opcode.ObjBranchNot:
            case Opcode.ObjBranchEquals:
                this.writeBranch(context, opcode, operand as Label);
                break;
            case Opcode.JoinString:
                this.writeJoinString(context, operand as number);
                break;
            case Opcode.Discard:
                this.writeDiscard(context, operand as BaseVarType);
                break;
            case Opcode.Gosub:
                this.writeGosub(context, operand as ScriptSymbol);
                break;
            case Opcode.Jump:
                this.writeJump(context, operand as ScriptSymbol);
                break;
            case Opcode.Command:
                this.writeCommand(context, operand as ScriptSymbol);
                break;
            case Opcode.Return:
                this.writeReturn(context);
                break;
            case Opcode.Add:
            case Opcode.Sub:
            case Opcode.Multiply:
            case Opcode.Divide:
            case Opcode.Modulo:
            case Opcode.Or:
            case Opcode.And:
            case Opcode.LongAdd:
            case Opcode.LongSub:
            case Opcode.LongMultiply:
            case Opcode.LongDivide:
            case Opcode.LongModulo:
            case Opcode.LongOr:
            case Opcode.LongAnd:
                this.writeMath(context, opcode);
                break;
            case Opcode.LineNumber:
                throw new Error('LineNumber opcode should not exist.');
        }
    }

    protected enterBlock(context: T, block: Block): void {
        throw new Error('Not implemented');
    }
    protected writePushConstantInt(context: T, value: number): void {
        throw new Error('Not implemented');
    }
    protected writePushConstantString(context: T, value: string): void {
        throw new Error('Not implemented');
    }
    protected writePushConstantLong(context: T, value: bigint): void {
        throw new Error('Not implemented');
    }
    protected writePushConstantSymbol(context: T, value: RuneScriptSymbol): void {
        throw new Error('Not implemented');
    }
    protected writePushLocalVar(context: T, symbol: LocalVariableSymbol): void {
        throw new Error('Not implemented');
    }
    protected writePopLocalVar(context: T, symbol: LocalVariableSymbol): void {
        throw new Error('Not implemented');
    }
    protected writePushVar(context: T, symbol: BasicSymbol, dot: boolean): void {
        throw new Error('Not implemented');
    }
    protected writePopVar(context: T, symbol: BasicSymbol, dot: boolean): void {
        throw new Error('Not implemented');
    }
    protected writeDefineArray(context: T, symbol: LocalVariableSymbol): void {
        throw new Error('Not implemented');
    }
    protected writeSwitch(context: T, switchTable: SwitchTable): void {
        throw new Error('Not implemented');
    }
    protected writeBranch(context: T, opcode: Opcode<any>, label: Label): void {
        throw new Error('Not implemented');
    }
    protected writeJoinString(context: T, count: number): void {
        throw new Error('Not implemented');
    }
    protected writeDiscard(context: T, baseType: BaseVarType): void {
        throw new Error('Not implemented');
    }
    protected writeJump(context: T, symbol: ScriptSymbol): void {
        throw new Error('Not implemented');
    }
    protected writeGosub(context: T, symbol: ScriptSymbol): void {
        throw new Error('Not implemented');
    }
    protected writeCommand(context: T, symbol: ScriptSymbol): void {
        throw new Error('Not implemented');
    }
    protected writeReturn(context: T): void {
        throw new Error('Not implemented');
    }
    protected writeMath(context: T, opcode: Opcode<any>): void {
        throw new Error('Not implemented');
    }

    /**
     * ==================
     * RuneScript helpers
     * ==================
     */

    /**
     * Returns a mapping of instruction index to line number. This modifies the
     * list of instruction by removing any instruction with an opcode of
     * [Opcode.LineNumber].
     */
    static generateLineNumberTable(script: RuneScript): Map<number, number> {
        const table = new Map<number, number>();
        let index = 0;
        let prevLine = -1;

        for (const block of script.blocks) {
            for (const instruction of block.instructions) {
                const line = instruction.source?.line;
                if (line !== undefined && line !== prevLine) {
                    table.set(index, line);
                    prevLine = line;
                }
                index++;
            }
        }
        return table;
    }

    /**
     * Returns a mapping of where all [Label]s are located.
     *
     * **WARNING**: This should be called **after** all other things that modify
     * the instruction lists.
     */
    static generateJumpTable(script: RuneScript): Map<Label, number> {
        const table = new Map<Label, number>();
        let index = 0;
        for (const block of script.blocks) {
            table.set(block.label, index);
            index += block.instructions.length;
        }
        return table;
    }

    /**
     * ==================
     * LocalTable helpers
     * ==================
     */

    /**
     * Returns the total number of parameters with a base var type of [baseType].
     */
    static getParameterCount(localTable: LocalTable, baseType: BaseVarType): number {
        return localTable.parameters.filter(p => p.type.baseType === baseType).length;
    }

    /**
     * Returns the total number of local variables with a base var type of [baseType].
     */
    static getLocalCount(localTable: LocalTable, baseType: BaseVarType): number {
        return localTable.all.filter(v => v.type.baseType === baseType && (!(v.type instanceof ArrayType) || localTable.parameters.includes(v))).length;
    }

    /**
     * Finds the unique identifier for the given [local] variable.
     */
    static getVariableId(localTable: LocalTable, local: LocalVariableSymbol): number {
        if (local.type instanceof ArrayType) {
            return localTable.all.filter(v => v.type instanceof ArrayType).indexOf(local);
        }

        return localTable.all.filter(v => v.type.baseType === local.type.baseType && (!(v.type instanceof ArrayType) || localTable.parameters.includes(v))).indexOf(local);
    }
}

/**
 * A base class passed that contains the context of the [ScriptWriter] when writing
 * specific instructions.
 */
export class BaseScriptWriterContext {
    curIndex = 0;
    readonly lineNumberTable: Map<number, number>;
    readonly jumpTable: Map<Label, number>;
    constructor(public readonly script: RuneScript) {
        this.lineNumberTable = BaseScriptWriter.generateLineNumberTable(script);
        this.jumpTable = BaseScriptWriter.generateJumpTable(script);
    }

    close(): void {}
}

/**
 * A helper that maps [Symbol]s to their id.
 */
export interface IdProvider {
    /**
     * Takes a [Symbol] and returns an [Int] that represents the symbol for runtime use.
     *
     * It is up to implementation to support id generation if something wasn't originally mapped before.
     *
     * The main symbol types are `ScriptSymbol`, `ConfigSymbol`, and `BasicSymbol`.
     */
    get(symbol: RuneScriptSymbol): number;
}
