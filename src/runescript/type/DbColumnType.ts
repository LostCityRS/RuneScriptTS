import { BaseVarType } from '#/compiler/type/BaseVarType.js';
import { Type } from '#/compiler/type/Type.js';
import { MutableOptionsType, TypeOptions } from '#/compiler/type/TypeOptions.js';

import { WrappedType } from '#/compiler/type/wrapped/WrappedType.js';

/**
 * Represents a database column. The [inner] type is what is returned when accessing
 * the data of a row.
 */
export class DbColumnType implements WrappedType {
    readonly representation: string;
    readonly code?: string;
    readonly baseType = BaseVarType.INTEGER;
    readonly defaultValue = -1;
    readonly options: TypeOptions;

    constructor(public readonly inner: Type) {
        this.representation = `dbcolumn<${inner.representation}>`;
        this.options = new MutableOptionsType({
            allowSwitch: false,
            allowArray: false,
            allowDeclaration: false,
            allowParameter: true
        });
    }
}
