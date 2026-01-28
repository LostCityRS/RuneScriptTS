import { Expression } from './expr/Expression';
import { Identifier } from './expr/Identifier';
import { Node } from './Node';
import { Parameter } from './Parameter';
import { Statement } from './statement/Statement';
import { Token } from './Token';

export abstract class AstVisitor<R> {
    visitParameter(parameter: Parameter): R {
        return this.visitNode(parameter);
    }

    visitStatement(statement: Statement): R {
        return this.visitNode(statement);
    }

    visitExpression(expression: Expression): R {
        return this.visitNode(expression);
    }

    visitIdentifier(identifier: Identifier): R {
        return this.visitExpression(identifier);
    }

    visitToken(token: Token): R {
        return this.visitNode(token);
    }

    visitNode(node: Node): R {
        throw new Error(`not implemented: ${node.constructor.name}`);
    }
}