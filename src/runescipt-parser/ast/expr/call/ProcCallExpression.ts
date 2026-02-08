import { AstVisitor } from "../../AstVisitor";
import { NodeKind } from "../../NodeKind";
import type { NodeSourceLocation } from "../../NodeSourceLocation";
import { Expression } from "../Expression";
import { Identifier } from "../Identifier";
import { CallExpression } from "./CallExpression";

/**
 * A CallExpression for calling other (proc) scripts.
 */
export class ProcCallExpression extends CallExpression {
    public readonly kind = NodeKind.ProcCallExpression;

    public constructor(source: NodeSourceLocation, name: Identifier, args: Expression[]) {
      super(source, name, args);
    }

    public accept<R>(visitor: AstVisitor<R>): R {
        return visitor.visitProcCallExpression(this);
    }
}