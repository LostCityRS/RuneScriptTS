import { Type } from '../type/Type';

/**
 * A basic representation of a symbol for RuneScript. A symbol can represent
 * anything that is able to be referenced within a script or config file.
 *
 * @see SymbolTable
 */
export interface Symbol {
    readonly name: string;
}

/**
 * Script local variables
 */
export class LocalVariableSymbol implements Symbol {
    constructor(public readonly name: string, public readonly type: Type) {}
}

/**
 * Symbols with constant values, new ones should also be included in TypeChecking.isConstantSymbol
 */
export class BasicSymbol implements Symbol {
    constructor(
        public readonly name: string,
        public readonly type: Type,
        public readonly isProtected: boolean = false
    ) {}
}

export class ConstantSymbol implements Symbol {
    constructor(public readonly name: string, public readonly value: string) {}
}