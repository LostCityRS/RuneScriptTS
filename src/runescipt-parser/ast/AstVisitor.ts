import { CalcExpression } from './expr/CalcExpression';
import { CallExpression } from './expr/call/CallExpression';
import { ClientScriptExpression } from './expr/ClientScriptExpression';
import { Expression } from './expr/Expression';
import { Identifier } from './expr/Identifier';
import { IntegerLiteral } from './expr/literal/IntegerLiteral';
import { JoinedStringExpression } from './expr/JoinedStringExpression';
import { Literal } from './expr/literal/Literal';
import { ParenthesizedExpression } from './expr/ParenthesizedExpression';
import { StringPart } from './expr/StringPart';
import { Node } from './Node';
import { Parameter } from './Parameter';
import { Statement } from './statement/Statement';
import { Token } from './Token';
import { CoordLiteral } from './expr/literal/CoordLiteral';
import { CommandCallExpression } from './expr/call/CommandCallExpression';
import { ProcCallExpression } from './expr/call/ProcCallExpression';
import { JumpCallExpression } from './expr/call/JumpCallExpression';
import { BooleanLiteral } from './expr/literal/BooleanLiteral';
import { CharacterLiteral } from './expr/literal/CharacterLiteral';
import { StringLiteral } from './expr/literal/StringLiteral';
import { NullLiteral } from './expr/literal/NullLiteral';
import { BinaryExpression } from './expr/BinaryExpression';
import { ArithmeticExpression } from './expr/ArithmeticExpression';
import { ConditionExpression } from './expr/ConditionExpression';
import { VariableExpression } from './expr/variable/VariableExpression';
import { ConstantVariableExpression } from './expr/variable/ConstantVariableExpression';
import { GameVariableExpression } from './expr/variable/GameVariableExpression';
import { LocalVariableExpression } from './expr/variable/LocalVariableExpression';
import { ScriptFile } from './ScriptFile';
import { Script } from './Scripts';
import { ReturnStatement } from './statement/ReturnStatement';
import { EmptyStatement } from './statement/EmptyStatement';
import { IfStatement } from './statement/IfStatement';
import { DeclarationStatement } from './statement/DeclarationStatement ';
import { BlockStatement } from './statement/BlockStatement';
import { WhileStatement } from './statement/WhileStatement';
import { ExpressionStatement } from './statement/ExpressionStatement';
import { SwitchCase } from './statement/SwitchCase';
import { SwitchStatement } from './statement/SwitchStatement';
import { AssignmentStatement } from './statement/AssignmentStatement';
import { ArrayDeclarationStatement } from './statement/ArrayDeclarationStatement';

export abstract class AstVisitor<R> {
    visitScriptFile(scriptFile: ScriptFile): R {
        return this.visitNode(scriptFile);
    }

    visitScript(script: Script): R {
        return this.visitNode(script);
    }
    
    visitParameter(parameter: Parameter): R {
        return this.visitNode(parameter);
    }

    visitBlockStatement(blockStatement: BlockStatement): R {
        return this.visitStatement(blockStatement);
    }

    visitReturnStatement(returnStatement: ReturnStatement): R {
        return this.visitStatement(returnStatement);
    }

    visitIfStatement(ifStatement: IfStatement): R {
        return this.visitStatement(ifStatement);
    }

    visitWhileStatement(whileStatement: WhileStatement): R {
        return this.visitStatement(whileStatement);
    }

    visitSwitchStatement(switchStatement: SwitchStatement): R {
        return this.visitStatement(switchStatement);
    }

    visitSwitchCase(switchCase: SwitchCase): R {
        return this.visitNode(switchCase);
    }

    visitDeclarationStatement(declarationStatement: DeclarationStatement): R {
        return this.visitStatement(declarationStatement);
    }

    visitArrayDeclarationStatement(arrayDeclarationStatement: ArrayDeclarationStatement): R {
        return this.visitStatement(arrayDeclarationStatement);
    }

    visitAssignmentStatement(assignmentStatement: AssignmentStatement): R {
        return this.visitStatement(assignmentStatement);
    }

    visitExpressionStatement(expressionStatement: ExpressionStatement): R {
        return this.visitStatement(expressionStatement);
    }

    visitEmptyStatement(emptyStatement: EmptyStatement): R {
        return this.visitStatement(emptyStatement);
    }

    visitStatement(statement: Statement): R {
        return this.visitNode(statement);
    }

    visitParenthesizedExpression(parenthesizedExpression: ParenthesizedExpression): R {
        return this.visitExpression(parenthesizedExpression);
    }

    visitConditionExpression(conditionExpression: ConditionExpression): R {
        return this.visitBinaryExpression(conditionExpression);
    }

    visitArithmeticExpression(arithmeticExpression: ArithmeticExpression): R {
        return this.visitBinaryExpression(arithmeticExpression);
    }

    visitBinaryExpression(binaryExpression: BinaryExpression): R {
        return this.visitExpression(binaryExpression);
    }

    visitCalcExpression(calcExpression: CalcExpression): R {
        return this.visitExpression(calcExpression);
    }

    visitProcCallExpression(procCallExpression: ProcCallExpression): R {
        return this.visitCallExpression(procCallExpression);
    }

    visitCommandCallExpression(commandCallExpression: CommandCallExpression): R {
        return this.visitCallExpression(commandCallExpression);
    }

    visitJumpCallExpression(jumpCallExpression: JumpCallExpression): R {
        return this.visitCallExpression(jumpCallExpression);
    }

    visitCallExpression(callExpression: CallExpression): R {
        return this.visitExpression(callExpression);
    }

    visitClientScriptExpression(clientScriptExpression: ClientScriptExpression): R {
        return this.visitExpression(clientScriptExpression);
    }

    visitLocalVariableExpression(localVariableExpression: LocalVariableExpression): R {
        return this.visitVariableExpression(localVariableExpression);
    }

    visitGameVariableExpression(gameVariableExpression: GameVariableExpression): R {
        return this.visitVariableExpression(gameVariableExpression);
    }

    visitConstantVariableExpression(constantVariableExpression: ConstantVariableExpression): R {
        return this.visitVariableExpression(constantVariableExpression);
    }

    visitVariableExpression(variableExpression: VariableExpression): R {
        return this.visitExpression(variableExpression);
    }

    visitExpression(expression: Expression): R {
        return this.visitNode(expression);
    }

    visitIntegerLiteral(integerLiteral: IntegerLiteral): R {
        return this.visitLiteral(integerLiteral);
    }

    visitCoordLiteral(coordLiteral: CoordLiteral): R {
        return this.visitLiteral(coordLiteral);
    }

    visitBooleanLiteral(booleanLiteral: BooleanLiteral): R {
        return this.visitLiteral(booleanLiteral);
    }

    visitCharacterLiteral(characterLiteral: CharacterLiteral): R {
        return this.visitLiteral(characterLiteral);
    }

    visitNullLiteral(nullLiteral: NullLiteral): R {
        return this.visitLiteral(nullLiteral);
    }

    visitStringLiteral(stringLiteral: StringLiteral): R {
        return this.visitLiteral(stringLiteral);
    }

    visitLiteral(literal: Literal<unknown>): R {
        return this.visitExpression(literal);
    }

    visitJoinedStringExpression(joinedStringExpression: JoinedStringExpression): R {
        return this.visitExpression(joinedStringExpression);
    }

    visitJoinedStringPart(stringPart: StringPart): R {
        return this.visitNode(stringPart);
    }

    visitIdentifier(identifier: Identifier): R {
        return this.visitExpression(identifier);
    }

    visitToken(token: Token): R {
        return this.visitNode(token);
    }

    visitNode(node: Node): R {
        throw new Error(`Not implemented: ${node.constructor.name}`);
    }
}