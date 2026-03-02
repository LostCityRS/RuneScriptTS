import { BaseVarType } from '#/runescript-compiler/type/BaseVarType.js';
import { MetaType } from '#/runescript-compiler/type/MetaType.js';
import { Type } from '#/runescript-compiler/type/Type.js';
import { MutableOptionsType, TypeOptions } from '#/runescript-compiler/type/TypeOptions.js';

import { WrappedType } from '#/runescript-compiler/type/wrapped/WrappedType.js';

export class ParamType implements WrappedType {
    readonly representation: string;
    readonly code?: string;
    readonly baseType = BaseVarType.INTEGER;
    readonly defaultValue = -1;
    readonly options: TypeOptions;

    constructor(public readonly inner: Type) {
        this.representation = inner == MetaType.Any ? 'param' : `param<${inner.representation}>`;
        this.options = new MutableOptionsType({
            allowSwitch: false,
            allowArray: false,
            allowDeclaration: false,
            allowParameter: true
        });
    }
}
