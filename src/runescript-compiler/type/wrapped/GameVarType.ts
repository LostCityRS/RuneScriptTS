import { BaseVarType } from '../BaseVarType';
import { Type } from '../Type';
import { MutableOptionsType, TypeOptions } from '../TypeOptions';
import { WrappedType } from './WrappedType';

/**
 * Base game variable type
 */
export abstract class GameVarType implements WrappedType {
    abstract readonly inner: Type;
    abstract readonly representation: string;

    readonly code: string | null = null;
    readonly baseType: BaseVarType | null = null;
    readonly defaultValue: unknown | null = null;

    readonly options: TypeOptions = new MutableOptionsType({
        allowArray: false,
        allowDeclaration: false,
        allowSwitch: false,
    });
}

/**
 * Implementations
 */
export class VarPlayerType extends GameVarType {
    readonly representation: string;
    
    constructor(public readonly inner: Type) {
        super();
        this.representation = `varp<${inner.representation}>`;
    }
}

export class VarBitType extends GameVarType {
    readonly representation: string;

    constructor(public readonly inner: Type) {
        super();
        this.representation = `varbit<${inner.representation}>`;
    }
}

export class VarNpcType extends GameVarType {
    readonly representation: string;

    constructor(public readonly inner: Type) {
        super();
        this.representation = `varn<${inner.representation}>`;
    }
}

export class VarSharedType extends GameVarType {
    readonly representation: string;

    constructor(public readonly inner: Type) {
        super();
        this.representation = `vars<${inner.representation}>`;
    }
}