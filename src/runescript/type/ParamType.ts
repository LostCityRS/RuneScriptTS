import { BaseVarType } from '#/compiler/type/BaseVarType.js';
import { MetaType } from '#/compiler/type/MetaType.js';
import { Type } from '#/compiler/type/Type.js';
import { MutableOptionsType, TypeOptions } from '#/compiler/type/TypeOptions.js';

import { WrappedType } from '#/compiler/type/wrapped/WrappedType.js';

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
