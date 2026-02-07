import { ScriptSymbol } from '../symbol/ScriptSymbol';
import { BasicSymbol, LocalVariableSymbol, RuneScriptSymbol } from '../symbol/Symbol';
import { BaseVarType } from '../type/BaseVarType';
import { Label } from './script/Label';
import { SwitchTable } from './script/SwitchTable';

/**
 * Represents a single bytecode opcode. Each opcode has a single operand type of [T].
 */
export class Opcode<T> {
    constructor() {}

    /**
     * Pushes a constant [Int] to the stack.
     *
     * Operand: The value to push to the stack.
     */
    static readonly PushConstantInt = new Opcode<number>();

    /**
     * Pushes a constant [String] to the stack.
     *
     * Operand: The value to push to the stack.
     */
    static readonly PushConstantString = new Opcode<string>();
    
    /**
     * Pushes a constant [Long] to the stack.
     *
     * Operand: The value to push to the stack.
     */
    static readonly PushConstantLong = new Opcode<bigint>();
    
    /**
     * Pushes a constant [Symbol] to the stack.
     *
     * Operand: The value to push to the stack.
     */
    static readonly PushConstantSymbol = new Opcode<RuneScriptSymbol>();
    
    /**
     * Pushes the value of the local variable to the stack.
     *
     * Operand: The local variable.
     */
    static readonly PushLocalVar = new Opcode<LocalVariableSymbol>();
    
    /**
     * Pops a value from the stack and stores it in the local variable.
     *
     * Operand: The local variable.
     */
    static readonly PopLocalVar = new Opcode<LocalVariableSymbol>();
    
    /**
     * Pushes the value of the game variable to the stack.
     *
     * Operand: The game variable.
     */
    static readonly PushVar = new Opcode<BasicSymbol>();
    
    /**
     * Pushes the value of the dot game variable to the stack.
     *
     * Operand: The game variable.
     */
    static readonly PushVar2 = new Opcode<BasicSymbol>();
    
    /**
     * Pops a value from the stack and stores it in the game variable.
     *
     * Operand: The game variable.
     */
    static readonly PopVar = new Opcode<BasicSymbol>();
    
    /**
     * Pops a value from the stack and stores it in the dot game variable.
     *
     * Operand: The game variable.
     */
    static readonly PopVar2 = new Opcode<BasicSymbol>();
    
    /**
     * Defines a local array variable.
     *
     * Operand: The local variable.
     */
    static readonly DefineArray = new Opcode<LocalVariableSymbol>();
    
    /**
     * Looks up a location to jump to based on a popped value from the stack.
     *
     * Operand: The switch table defining all cases and jump locations.
     */
    static readonly Switch = new Opcode<SwitchTable>();
    
    /**
     * Jumps to the defined label.
     *
     * Operand: The label to jump to.
     */
    static readonly Branch = new Opcode<Label>();
    
    /**
     * Pops two [Int]s from the stack and if they are **not** equal (`!`) jumps to the label.
     *
     * Operand: The label to jump to.
     */
    static readonly BranchNot = new Opcode<Label>();
    
    /**
     * Pops two [Int]s from the stack and if they are equal (`=`) jumps to the label.
     *
     * Operand: The label to jump to.
     */
    static readonly BranchEquals = new Opcode<Label>();
    
    /**
     * Pops two [Int]s from the stack and if the first is less than (`<`) the second jumps to the label.
     *
     * Operand: The label to jump to.
     */
    static readonly BranchLessThan = new Opcode<Label>();
    
    /**
     * Pops two [Int]s from the stack and if the first is greater than (`>`) the second jumps to the label.
     *
     * Operand: The label to jump to.
     */
    static readonly BranchGreaterThan = new Opcode<Label>();
    
    /**
     * Pops two [Int]s from the stack and if the first is less than or equal (`<=`) to the second jumps to the label.
     *
     * Operand: The label to jump to.
     */
    static readonly BranchLessThanOrEquals = new Opcode<Label>();
    
    /**
     * Pops two [Int]s from the stack and if the first is greater than or equal (`>=`) to the second jumps to the label.
     *
     * Operand: The label to jump to.
     */
    static readonly BranchGreaterThanOrEquals = new Opcode<Label>();
    
    /**
     * Pops two [Long]s from the stack and if they are **not** equal (`!`) jumps to the label.
     *
     * Operand: The label to jump to.
     */
    static readonly LongBranchNot = new Opcode<Label>();
    
    /**
     * Pops two [Long]s from the stack and if they are equal (`=`) jumps to the label.
     *
     * Operand: The label to jump to.
     */
    static readonly LongBranchEquals = new Opcode<Label>();
    
    /**
     * Pops two [Long]s from the stack and if the first is less than (`<`) the second jumps to the label.
     *
     * Operand: The label to jump to.
     */
    static readonly LongBranchLessThan = new Opcode<Label>();
    
    /**
     * Pops two [Long]s from the stack and if the first is greater than (`>`) the second jumps to the label.
     *
     * Operand: The label to jump to.
     */
    static readonly LongBranchGreaterThan = new Opcode<Label>();
    
    /**
     * Pops two [Long]s from the stack and if the first is less than or equal (`<=`) to the second jumps to the label.
     *
     * Operand: The label to jump to.
     */
    static readonly LongBranchLessThanOrEquals = new Opcode<Label>();
    
    /**
     * Pops two [Long]s from the stack and if the first is greater than or equal (`>=`) to the second jumps to the label.
     *
     * Operand: The label to jump to.
     */
    static readonly LongBranchGreaterThanOrEquals = new Opcode<Label>();
    
    /**
     * Pops two [Any]s from the stack and if they are **not** equal (`!`) jumps to the label.
     *
     * Operand: The label to jump to.
     */
    static readonly ObjBranchNot = new Opcode<Label>();
    
    /**
     * Pops two [Any]s from the stack and if they are equal (`=`) jumps to the label.
     *
     * Operand: The label to jump to.
     */
    static readonly ObjBranchEquals = new Opcode<Label>();
    
    /**
     * Joins a number of strings together into a single string.
     *
     * Operand: The number of strings to join together.
     */
    static readonly JoinString = new Opcode<number>();
    
    /**
     * Discards a value on the stack.
     *
     * Operand: The stack type to discard a value from.
     */
    static readonly Discard = new Opcode<BaseVarType>();
    
    /**
     * Calls another script with an optional return values.
     *
     * Operand: The script to call.
     */
    static readonly Gosub = new Opcode<ScriptSymbol>();
    
    /**
     * Jumps to another script while never returning to the original call site.
     *
     * Operand: The script to jump to.
     */
    static readonly Jump = new Opcode<ScriptSymbol>();
    
    /**
     * Calls an engine command with optional return values.
     *
     * Operand: The command to call.
     */
    static readonly Command = new Opcode<ScriptSymbol>();
    
    /**
     * Returns from the script.
     *
     * Operand: N/A
     */
    static readonly Return = new Opcode<void>();
    
    /**
     * ===============
     * Math operations
     * ===============
     */
    
    /**
     * Adds two [Int]s.
     *
     * Operand: N/A
     */
    static readonly Add = new Opcode<void>();
    
    /**
     * Subtracts two [Int]s.
     *
     * Operand: N/A
     */
    static readonly Sub = new Opcode<void>();
    
    /**
     * Multiplies two [Int]s together.
     *
     * Operand: N/A
     */
    static readonly Multiply = new Opcode<void>();
    
    /**
     * Divides two [Int]s together.
     *
     * Operand: N/A
     */
    static readonly Divide = new Opcode<void>();
    
    /**
     * Finds the remainder when dividing two [Int]s.
     *
     * Operand: N/A
     */
    static readonly Modulo = new Opcode<void>();
    
    /**
     * Applies bitwise-or on two [Int]s.
     *
     * Operand: N/A
     */
    static readonly Or = new Opcode<void>();
    
    /**
     * Applies bitwise-and on two [Int]s.
     *
     * Operand: N/A
     */
    static readonly And = new Opcode<void>();
    
    /**
     * Adds two [Long]s.
     *
     * Operand: N/A
     */
    static readonly LongAdd = new Opcode<void>();
    
    /**
     * Subtracts two [Long]s.
     *
     * Operand: N/A
     */
    static readonly LongSub = new Opcode<void>();
    
    /**
     * Multiplies two [Long]s together.
     *
     * Operand: N/A
     */
    static readonly LongMultiply = new Opcode<void>();
    
    /**
     * Divides two [Long]s together.
     *
     * Operand: N/A
     */
    static readonly LongDivide = new Opcode<void>();
    
    /**
     * Finds the remainder when dividing two [Long]s.
     *
     * Operand: N/A
     */
    static readonly LongModulo = new Opcode<void>();
    
    /**
     * Applies bitwise-or on two [Long]s.
     *
     * Operand: N/A
     */
    static readonly LongOr = new Opcode<void>();
    
    /**
     * Applies bitwise-and on two [Long]s.
     *
     * Operand: N/A
     */
    static readonly LongAnd = new Opcode<void>();
    
    /**
     * Marks the source line number of the code that follows. This opcode is
     * not meant to have any runtime alternative and is just intended for
     * building a line number table.
     *
     * Operand: The source line number.
     */
    static readonly LineNumber = new Opcode<number>();
}



