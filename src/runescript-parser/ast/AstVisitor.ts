import { CalcExpression } from '#/runescript-parser/ast/expr/CalcExpression.js';
import { CallExpression } from '#/runescript-parser/ast/expr/call/CallExpression.js';
import { ClientScriptExpression } from '#/runescript-parser/ast/expr/ClientScriptExpression.js';
import { Expression } from '#/runescript-parser/ast/expr/Expression.js';
import { Identifier } from '#/runescript-parser/ast/expr/Identifier.js';
import { IntegerLiteral } from '#/runescript-parser/ast/expr/literal/IntegerLiteral.js';
import { JoinedStringExpression } from '#/runescript-parser/ast/expr/JoinedStringExpression.js';
import { Literal } from '#/runescript-parser/ast/expr/literal/Literal.js';
import { ParenthesizedExpression } from '#/runescript-parser/ast/expr/ParenthesizedExpression.js';
import { StringPart } from '#/runescript-parser/ast/expr/StringPart.js';
import { Node } from '#/runescript-parser/ast/Node.js';
import { Parameter } from '#/runescript-parser/ast/Parameter.js';
import { Statement } from '#/runescript-parser/ast/statement/Statement.js';
import { Token } from '#/runescript-parser/ast/Token.js';
import { CoordLiteral } from '#/runescript-parser/ast/expr/literal/CoordLiteral.js';
import { CommandCallExpression } from '#/runescript-parser/ast/expr/call/CommandCallExpression.js';
import { ProcCallExpression } from '#/runescript-parser/ast/expr/call/ProcCallExpression.js';
import { JumpCallExpression } from '#/runescript-parser/ast/expr/call/JumpCallExpression.js';
import { BooleanLiteral } from '#/runescript-parser/ast/expr/literal/BooleanLiteral.js';
import { CharacterLiteral } from '#/runescript-parser/ast/expr/literal/CharacterLiteral.js';
import { StringLiteral } from '#/runescript-parser/ast/expr/literal/StringLiteral.js';
import { NullLiteral } from '#/runescript-parser/ast/expr/literal/NullLiteral.js';
import { BinaryExpression } from '#/runescript-parser/ast/expr/BinaryExpression.js';
import { ArithmeticExpression } from '#/runescript-parser/ast/expr/ArithmeticExpression.js';
import { ConditionExpression } from '#/runescript-parser/ast/expr/ConditionExpression.js';
import { VariableExpression } from '#/runescript-parser/ast/expr/variable/VariableExpression.js';
import { ConstantVariableExpression } from '#/runescript-parser/ast/expr/variable/ConstantVariableExpression.js';
import { GameVariableExpression } from '#/runescript-parser/ast/expr/variable/GameVariableExpression.js';
import { LocalVariableExpression } from '#/runescript-parser/ast/expr/variable/LocalVariableExpression.js';
import { ScriptFile } from '#/runescript-parser/ast/ScriptFile.js';
import { Script } from '#/runescript-parser/ast/Scripts.js';
import { ReturnStatement } from '#/runescript-parser/ast/statement/ReturnStatement.js';
import { EmptyStatement } from '#/runescript-parser/ast/statement/EmptyStatement.js';
import { IfStatement } from '#/runescript-parser/ast/statement/IfStatement.js';
import { DeclarationStatement } from '#/runescript-parser/ast/statement/DeclarationStatement.js';
import { BlockStatement } from '#/runescript-parser/ast/statement/BlockStatement.js';
import { WhileStatement } from '#/runescript-parser/ast/statement/WhileStatement.js';
import { ExpressionStatement } from '#/runescript-parser/ast/statement/ExpressionStatement.js';
import { SwitchCase } from '#/runescript-parser/ast/statement/SwitchCase.js';
import { SwitchStatement } from '#/runescript-parser/ast/statement/SwitchStatement.js';
import { AssignmentStatement } from '#/runescript-parser/ast/statement/AssignmentStatement.js';
import { ArrayDeclarationStatement } from '#/runescript-parser/ast/statement/ArrayDeclarationStatement.js';

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
