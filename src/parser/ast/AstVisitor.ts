import { Node } from '#/parser/ast/Node.js';
import { Parameter } from '#/parser/ast/Parameter.js';
import { ScriptFile } from '#/parser/ast/ScriptFile.js';
import { Script } from '#/parser/ast/Scripts.js';
import { Token } from '#/parser/ast/Token.js';

import { ArithmeticExpression } from '#/parser/ast/expr/ArithmeticExpression.js';
import { BinaryExpression } from '#/parser/ast/expr/BinaryExpression.js';
import { CalcExpression } from '#/parser/ast/expr/CalcExpression.js';
import { ClientScriptExpression } from '#/parser/ast/expr/ClientScriptExpression.js';
import { ConditionExpression } from '#/parser/ast/expr/ConditionExpression.js';
import { Expression } from '#/parser/ast/expr/Expression.js';
import { Identifier } from '#/parser/ast/expr/Identifier.js';
import { JoinedStringExpression } from '#/parser/ast/expr/JoinedStringExpression.js';
import { ParenthesizedExpression } from '#/parser/ast/expr/ParenthesizedExpression.js';
import { StringPart } from '#/parser/ast/expr/StringPart.js';

import { ConstantVariableExpression } from '#/parser/ast/expr/variable/ConstantVariableExpression.js';
import { GameVariableExpression } from '#/parser/ast/expr/variable/GameVariableExpression.js';
import { LocalVariableExpression } from '#/parser/ast/expr/variable/LocalVariableExpression.js';
import { VariableExpression } from '#/parser/ast/expr/variable/VariableExpression.js';

import { CallExpression } from '#/parser/ast/expr/call/CallExpression.js';
import { CommandCallExpression } from '#/parser/ast/expr/call/CommandCallExpression.js';
import { JumpCallExpression } from '#/parser/ast/expr/call/JumpCallExpression.js';
import { ProcCallExpression } from '#/parser/ast/expr/call/ProcCallExpression.js';

import { BooleanLiteral } from '#/parser/ast/expr/literal/BooleanLiteral.js';
import { CharacterLiteral } from '#/parser/ast/expr/literal/CharacterLiteral.js';
import { CoordLiteral } from '#/parser/ast/expr/literal/CoordLiteral.js';
import { IntegerLiteral } from '#/parser/ast/expr/literal/IntegerLiteral.js';
import { Literal } from '#/parser/ast/expr/literal/Literal.js';
import { NullLiteral } from '#/parser/ast/expr/literal/NullLiteral.js';
import { StringLiteral } from '#/parser/ast/expr/literal/StringLiteral.js';

import { ArrayDeclarationStatement } from '#/parser/ast/statement/ArrayDeclarationStatement.js';
import { AssignmentStatement } from '#/parser/ast/statement/AssignmentStatement.js';
import { BlockStatement } from '#/parser/ast/statement/BlockStatement.js';
import { DeclarationStatement } from '#/parser/ast/statement/DeclarationStatement.js';
import { EmptyStatement } from '#/parser/ast/statement/EmptyStatement.js';
import { ExpressionStatement } from '#/parser/ast/statement/ExpressionStatement.js';
import { IfStatement } from '#/parser/ast/statement/IfStatement.js';
import { ReturnStatement } from '#/parser/ast/statement/ReturnStatement.js';
import { Statement } from '#/parser/ast/statement/Statement.js';
import { SwitchCase } from '#/parser/ast/statement/SwitchCase.js';
import { SwitchStatement } from '#/parser/ast/statement/SwitchStatement.js';
import { WhileStatement } from '#/parser/ast/statement/WhileStatement.js';

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
