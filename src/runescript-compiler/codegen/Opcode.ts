import { ScriptSymbol } from '../symbol/ScriptSymbol';
import { BasicSymbol, LocalVariableSymbol, Symbol } from '../symbol/Symbol';
import { BaseVarType } from '../type/BaseVarType';
import { Label } from './script/Label';
import { SwitchTable } from './script/SwitchTable';

/**
 * Represents a single bytecode opcode. Each opcode has a single operand type of [T].
 */
export class Opcode<T> {
    constructor() {}
}

/**
 * Pushes a constant [Int] to the stack.
 *
 * Operand: The value to push to the stack.
 */
export const PushConstantInt = new Opcode<number>();

/**
 * Pushes a constant [String] to the stack.
 *
 * Operand: The value to push to the stack.
 */
export const PushConstantString = new Opcode<string>();

/**
 * Pushes a constant [Long] to the stack.
 *
 * Operand: The value to push to the stack.
 */
export const PushConstantLong = new Opcode<bigint>();

/**
 * Pushes a constant [Symbol] to the stack.
 *
 * Operand: The value to push to the stack.
 */
export const PushConstantSymbol = new Opcode<Symbol>();

/**
 * Pushes the value of the local variable to the stack.
 *
 * Operand: The local variable.
 */
export const PushLocalVar = new Opcode<LocalVariableSymbol>();

/**
 * Pops a value from the stack and stores it in the local variable.
 *
 * Operand: The local variable.
 */
export const PopLocalVar = new Opcode<LocalVariableSymbol>();

/**
 * Pushes the value of the game variable to the stack.
 *
 * Operand: The game variable.
 */
export const PushVar = new Opcode<BasicSymbol>();

/**
 * Pushes the value of the dot game variable to the stack.
 *
 * Operand: The game variable.
 */
export const PushVar2 = new Opcode<BasicSymbol>();

/**
 * Pops a value from the stack and stores it in the game variable.
 *
 * Operand: The game variable.
 */
export const PopVar = new Opcode<BasicSymbol>();

/**
 * Pops a value from the stack and stores it in the dot game variable.
 *
 * Operand: The game variable.
 */
export const PopVar2 = new Opcode<BasicSymbol>();

/**
 * Defines a local array variable.
 *
 * Operand: The local variable.
 */
export const DefineArray = new Opcode<LocalVariableSymbol>();

/**
 * Looks up a location to jump to based on a popped value from the stack.
 *
 * Operand: The switch table defining all cases and jump locations.
 */
export const Switch = new Opcode<SwitchTable>();

/**
 * Jumps to the defined label.
 *
 * Operand: The label to jump to.
 */
export const Branch = new Opcode<Label>();

/**
 * Pops two [Int]s from the stack and if they are **not** equal (`!`) jumps to the label.
 *
 * Operand: The label to jump to.
 */
export const BranchNot = new Opcode<Label>();

/**
 * Pops two [Int]s from the stack and if they are equal (`=`) jumps to the label.
 *
 * Operand: The label to jump to.
 */
export const BranchEquals = new Opcode<Label>();

/**
 * Pops two [Int]s from the stack and if the first is less than (`<`) the second jumps to the label.
 *
 * Operand: The label to jump to.
 */
export const BranchLessThan = new Opcode<Label>();

/**
 * Pops two [Int]s from the stack and if the first is greater than (`>`) the second jumps to the label.
 *
 * Operand: The label to jump to.
 */
export const BranchGreaterThan = new Opcode<Label>();

/**
 * Pops two [Int]s from the stack and if the first is less than or equal (`<=`) to the second jumps to the label.
 *
 * Operand: The label to jump to.
 */
export const BranchLessThanOrEquals = new Opcode<Label>();

/**
 * Pops two [Int]s from the stack and if the first is greater than or equal (`>=`) to the second jumps to the label.
 *
 * Operand: The label to jump to.
 */
export const BranchGreaterThanOrEquals = new Opcode<Label>();

/**
 * Pops two [Long]s from the stack and if they are **not** equal (`!`) jumps to the label.
 *
 * Operand: The label to jump to.
 */
export const LongBranchNot = new Opcode<Label>();

/**
 * Pops two [Long]s from the stack and if they are equal (`=`) jumps to the label.
 *
 * Operand: The label to jump to.
 */
export const LongBranchEquals = new Opcode<Label>();

/**
 * Pops two [Long]s from the stack and if the first is less than (`<`) the second jumps to the label.
 *
 * Operand: The label to jump to.
 */
export const LongBranchLessThan = new Opcode<Label>();

/**
 * Pops two [Long]s from the stack and if the first is greater than (`>`) the second jumps to the label.
 *
 * Operand: The label to jump to.
 */
export const LongBranchGreaterThan = new Opcode<Label>();

/**
 * Pops two [Long]s from the stack and if the first is less than or equal (`<=`) to the second jumps to the label.
 *
 * Operand: The label to jump to.
 */
export const LongBranchLessThanOrEquals = new Opcode<Label>();

/**
 * Pops two [Long]s from the stack and if the first is greater than or equal (`>=`) to the second jumps to the label.
 *
 * Operand: The label to jump to.
 */
export const LongBranchGreaterThanOrEquals = new Opcode<Label>();

/**
 * Pops two [Any]s from the stack and if they are **not** equal (`!`) jumps to the label.
 *
 * Operand: The label to jump to.
 */
export const ObjBranchNot = new Opcode<Label>();

/**
 * Pops two [Any]s from the stack and if they are equal (`=`) jumps to the label.
 *
 * Operand: The label to jump to.
 */
export const ObjBranchEquals = new Opcode<Label>();

/**
 * Joins a number of strings together into a single string.
 *
 * Operand: The number of strings to join together.
 */
export const JoinString = new Opcode<number>();

/**
 * Discards a value on the stack.
 *
 * Operand: The stack type to discard a value from.
 */
export const Discard = new Opcode<BaseVarType>();

/**
 * Calls another script with an optional return values.
 *
 * Operand: The script to call.
 */
export const Gosub = new Opcode<ScriptSymbol>();

/**
 * Jumps to another script while never returning to the original call site.
 *
 * Operand: The script to jump to.
 */
export const Jump = new Opcode<ScriptSymbol>();

/**
 * Calls an engine command with optional return values.
 *
 * Operand: The command to call.
 */
export const Command = new Opcode<ScriptSymbol>();

/**
 * Returns from the script.
 *
 * Operand: N/A
 */
export const Return = new Opcode<void>();

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
export const Add = new Opcode<void>();

/**
 * Subtracts two [Int]s.
 *
 * Operand: N/A
 */
export const Sub = new Opcode<void>();

/**
 * Multiplies two [Int]s together.
 *
 * Operand: N/A
 */
export const Multiply = new Opcode<void>();

/**
 * Divides two [Int]s together.
 *
 * Operand: N/A
 */
export const Divide = new Opcode<void>();

/**
 * Finds the remainder when dividing two [Int]s.
 *
 * Operand: N/A
 */
export const Modulo = new Opcode<void>();

/**
 * Applies bitwise-or on two [Int]s.
 *
 * Operand: N/A
 */
export const Or = new Opcode<void>();

/**
 * Applies bitwise-and on two [Int]s.
 *
 * Operand: N/A
 */
export const And = new Opcode<void>();

/**
 * Adds two [Long]s.
 *
 * Operand: N/A
 */
export const LongAdd = new Opcode<void>();

/**
 * Subtracts two [Long]s.
 *
 * Operand: N/A
 */
export const LongSub = new Opcode<void>();

/**
 * Multiplies two [Long]s together.
 *
 * Operand: N/A
 */
export const LongMultiply = new Opcode<void>();

/**
 * Divides two [Long]s together.
 *
 * Operand: N/A
 */
export const LongDivide = new Opcode<void>();

/**
 * Finds the remainder when dividing two [Long]s.
 *
 * Operand: N/A
 */
export const LongModulo = new Opcode<void>();

/**
 * Applies bitwise-or on two [Long]s.
 *
 * Operand: N/A
 */
export const LongOr = new Opcode<void>();

/**
 * Applies bitwise-and on two [Long]s.
 *
 * Operand: N/A
 */
export const LongAnd = new Opcode<void>();

/**
 * Marks the source line number of the code that follows. This opcode is
 * not meant to have any runtime alternative and is just intended for
 * building a line number table.
 *
 * Operand: The source line number.
 */
export const LineNumber = new Opcode<number>();