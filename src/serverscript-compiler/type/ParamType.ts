import { BaseVarType } from "../../runescript-compiler/type/BaseVarType";
import { Type } from "../../runescript-compiler/type/Type";
import { MutableOptionsType, TypeOptions } from "../../runescript-compiler/type/TypeOptions";
import { WrappedType } from "../../runescript-compiler/type/wrapped/WrappedType";

export class ParamType implements WrappedType {
    readonly representation: string;
    readonly code?: string;
    readonly baseType = BaseVarType.INTEGER;
    readonly defaultValue = -1;
    readonly options: TypeOptions;

    constructor(public readonly inner: Type) {
        this.representation = `param<${inner.representation}>`;
        this.options = new MutableOptionsType({
            allowSwitch: false,
            allowArray: false,
            allowDeclaration: false
        });
    }
}