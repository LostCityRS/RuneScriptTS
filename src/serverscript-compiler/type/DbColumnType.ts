import { BaseVarType } from "../../runescript-compiler/type/BaseVarType";
import { Type } from "../../runescript-compiler/type/Type";
import { MutableOptionsType, TypeOptions } from "../../runescript-compiler/type/TypeOptions";
import { WrappedType } from "../../runescript-compiler/type/wrapped/WrappedType";

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
                allowDeclaration: false
            });
        }
}