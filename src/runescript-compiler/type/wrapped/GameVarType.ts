import { BaseVarType } from '#/runescript-compiler/type/BaseVarType.js';
import { Type } from '#/runescript-compiler/type/Type.js';
import { MutableOptionsType, TypeOptions } from '#/runescript-compiler/type/TypeOptions.js';
import { WrappedType } from '#/runescript-compiler/type/wrapped/WrappedType.js';

/**
 * Base game variable type
 */
export abstract class GameVarType implements WrappedType {
    abstract readonly inner: Type;
    abstract readonly representation: string;

    readonly code: string | undefined = undefined;
    readonly baseType: BaseVarType = BaseVarType.INTEGER;
    readonly defaultValue: unknown = -1;

    readonly options: TypeOptions = new MutableOptionsType({
        allowArray: false,
        allowDeclaration: false,
        allowSwitch: false
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
