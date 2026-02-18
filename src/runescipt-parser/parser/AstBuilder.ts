import { Node } from '../ast/Node';
import { ParserRuleContext } from 'antlr4ng';
import { Token as AntlrToken } from 'antlr4ng';
import type { NodeSourceLocation } from '../ast/NodeSourceLocation';
import { Expression } from '../ast/expr/Expression';
import { Token } from '../ast/Token'
import { ScriptFile } from '../ast/ScriptFile';
import { Script } from '../ast/Scripts';
import { Parameter } from '../ast/Parameter';
import { BlockStatement } from '../ast/statement/BlockStatement';
import { NullLiteral } from '../ast/expr/literal/NullLiteral';
import { ReturnStatement } from '../ast/statement/ReturnStatement';
import { IfStatement } from '../ast/statement/IfStatement';
import { WhileStatement } from '../ast/statement/WhileStatement';
import { SwitchStatement } from '../ast/statement/SwitchStatement';
import { SwitchCase } from '../ast/statement/SwitchCase';
import { DeclarationStatement } from '../ast/statement/DeclarationStatement ';
import { ArrayDeclarationStatement } from '../ast/statement/ArrayDeclarationStatement';
import { AssignmentStatement } from '../ast/statement/AssignmentStatement';
import { ExpressionStatement } from '../ast/statement/ExpressionStatement';
import { EmptyStatement } from '../ast/statement/EmptyStatement';
import { ParenthesizedExpression } from '../ast/expr/ParenthesizedExpression';
import { ArithmeticExpression } from '../ast/expr/ArithmeticExpression';
import { LocalVariableExpression } from '../ast/expr/variable/LocalVariableExpression';
import { CalcExpression } from '../ast/expr/CalcExpression';
import { CommandCallExpression } from '../ast/expr/call/CommandCallExpression';
import { ProcCallExpression } from '../ast/expr/call/ProcCallExpression';
import { JumpCallExpression } from '../ast/expr/call/JumpCallExpression';
import { ClientScriptExpression } from '../ast/expr/ClientScriptExpression';
import { GameVariableExpression } from '../ast/expr/variable/GameVariableExpression';
import { ConstantVariableExpression } from '../ast/expr/variable/ConstantVariableExpression';
import { IntegerLiteral } from '../ast/expr/literal/IntegerLiteral';
import { CoordLiteral } from '../ast/expr/literal/CoordLiteral';
import { BooleanLiteral } from '../ast/expr/literal/BooleanLiteral';
import { ConditionExpression } from '../ast/expr/ConditionExpression';
import { CharacterLiteral } from '../ast/expr/literal/CharacterLiteral';
import { StringLiteral } from '../ast/expr/literal/StringLiteral';
import { JoinedStringExpression } from '../ast/expr/JoinedStringExpression';
import { BasicStringPart, ExpressionStringPart, PTagStringPart, StringPart } from '../ast/expr/StringPart';
import { Identifier } from '../ast/expr/Identifier';
import { AdvancedIdentifierContext, ArithmeticBinaryExpressionContext, ArithmeticNormalExpressionContext, ArithmeticParenthesizedExpressionContext, ArrayDeclarationStatementContext, AssignmentStatementContext, BlockStatementContext, BooleanLiteralContext, CalcExpressionContext, CallExpressionContext, CharacterLiteralContext, ClientScriptContext, CommandCallExpressionContext, ConditionBinaryExpressionContext, ConditionNormalExpressionContext, ConditionParenthesizedExpressionContext, ConstantVariableContext, ConstantVariableExpressionContext, CoordLiteralContext, DeclarationStatementContext, EmptyStatementContext, ExpressionListContext, ExpressionStatementContext, GameVariableContext, GameVariableExpressionContext, IdentifierContext, IdentifierExpressionContext, IfStatementContext, IntegerLiteralContext, JoinedStringContext, JoinedStringExpressionContext, JumpCallExpressionContext, LiteralExpressionContext, LocalArrayVariableContext, LocalArrayVariableExpressionContext, LocalVariableContext, LocalVariableExpressionContext, NullLiteralContext, ParameterContext, ParenthesisContext, ParenthesizedExpressionContext, ProcCallExpressionContext, ReturnStatementContext, ScriptContext, ScriptFileContext, SingleExpressionContext, StringExpressionContext, StringLiteralContentContext, StringLiteralContext, StringPTagContext, StringTagContext, SwitchCaseContext, SwitchStatementContext, WhileStatementContext } from '../../antlr/RuneScriptParser';
import { RuneScriptParserVisitor } from '../../antlr/RuneScriptParserVisitor.js';

/**
 * A visitor that converts an antlr parse tree into an [AST](https://en.wikipedia.org/wiki/Abstract_syntax_tree). See
 * [Node] implementations for all possible pieces of the tree.
 */
export class AstBuilder extends RuneScriptParserVisitor<Node> {
    private source: string;
    private lineOffset: number;
    private columnOffset: number;

    public constructor(source: string, lineoffset: number, columnOffset: number) {
        super();
        this.source = source;
        this.lineOffset = lineoffset;
        this.columnOffset = columnOffset;
    }

    visitScriptFile = (ctx: ScriptFileContext): Node => {
        return new ScriptFile(this.location(ctx), ctx.script().map((script) => this.visitNode(script)));
    }

    visitScript = (ctx: ScriptContext): Node => {
        const returns = ctx.typeList()?.IDENTIFIER()?.map((node) => this.toAstToken(node.symbol));

        return new Script({
            source: this.location(ctx),
            trigger: this.visitNode(ctx._trigger),
            name: this.visitNode(ctx._name),
            isStar: ctx.MUL() !== null,
            parameters: ctx.parameterList()?.parameter().map((param) => this.visitNode(param)) ?? null,
            returnTokens: returns ?? null,
            statements: ctx.statement().map((statement) => this.visitNode(statement)),
        });
    }

    visitParameter = (ctx: ParameterContext): Node => {
        return new Parameter(this.location(ctx), this.toAstToken(ctx._type_), this.visitNode(ctx.advancedIdentifier()));
    }

    visitBlockStatement = (ctx: BlockStatementContext): Node => {
        return new BlockStatement(this.location(ctx), ctx.statement().map((statement) => this.visitNode(statement)));
    }

    visitReturnStatement = (ctx: ReturnStatementContext): Node => {
        return new ReturnStatement(this.location(ctx), this.collectExpressionList(ctx.expressionList()));
    }

    visitIfStatement = (ctx: IfStatementContext): Node => {
        const statements = ctx.statement();
        if (!statements[0]) {
            throw new Error("IfStatement missing then statement.");
        }
        return new IfStatement(
            this.location(ctx),
            this.visitNode(ctx.condition()),
            this.visitNode(statements[0]),
            statements.length > 1 ? this.visitNode(statements[1]) : null
        );
    }

    visitWhileStatement = (ctx: WhileStatementContext): Node => {
        return new WhileStatement(this.location(ctx), this.visitNode(ctx.condition()), this.visitNode(ctx.statement()));
    }

    visitSwitchStatement = (ctx: SwitchStatementContext): Node => {
        return new SwitchStatement(
            this.location(ctx),
            this.toAstToken(ctx.SWITCH_TYPE().symbol),
            this.extractParenthesisExpression(ctx.parenthesis()),
            ctx.switchCase().map((switchCase) => this.visitNode(switchCase))
        );
    }

    visitSwitchCase = (ctx: SwitchCaseContext): Node => {
        return new SwitchCase(
            this.location(ctx),
            this.collectExpressionList(ctx.expressionList()),
            ctx.statement()?.map((statement) => this.visitNode(statement)) ?? []
        );
    }

    visitDeclarationStatement = (ctx: DeclarationStatementContext): Node => {
        return new DeclarationStatement(
            this.location(ctx),
            this.toAstToken(ctx.DEF_TYPE().symbol),
            this.visitNode(ctx.advancedIdentifier()),
            ctx.expression() ? this.visitNode(ctx.expression()) : null
        );
    }

    visitArrayDeclarationStatement = (ctx: ArrayDeclarationStatementContext): Node => {
        return new ArrayDeclarationStatement(
            this.location(ctx),
            this.toAstToken(ctx.DEF_TYPE().symbol),
            this.visitNode(ctx.advancedIdentifier()),
            this.extractParenthesisExpression(ctx.parenthesis())
        );
    }

    visitAssignmentStatement = (ctx: AssignmentStatementContext): Node => {
        return new AssignmentStatement(
            this.location(ctx),
            ctx.assignableVariableList()
                .assignableVariable()
                .map((variable) => this.visitNode(variable)),
                this.collectExpressionList(ctx.expressionList())
        );
    }

    visitExpressionStatement = (ctx: ExpressionStatementContext): Node => {
        return new ExpressionStatement(this.location(ctx), this.visitNode(ctx.expression()));
    }

    visitEmptyStatement = (ctx: EmptyStatementContext): Node => {
        return new EmptyStatement(this.location(ctx));
    }

    visitSingleExpression = (ctx: SingleExpressionContext): Node => {
        return this.visitNode(ctx.expression());
    }

    visitParenthesizedExpression = (ctx: ParenthesizedExpressionContext): Node => {
        return new ParenthesizedExpression(this.location(ctx), this.extractParenthesisExpression(ctx.parenthesis()));
    }

    visitConditionParenthesizedExpression = (ctx: ConditionParenthesizedExpressionContext): Node => {
        return new ParenthesizedExpression(this.location(ctx), this.visitNode(ctx.condition()));
    }

    visitArithmeticParenthesizedExpression = (ctx: ArithmeticParenthesizedExpressionContext): Node => {
        return new ParenthesizedExpression(this.location(ctx), this.visitNode(ctx.arithmetic()));
    }

    visitConditionBinaryExpression = (ctx: ConditionBinaryExpressionContext): Node => {
        return new ConditionExpression(
            this.location(ctx),
            this.visitNode(ctx.condition(0)),
            this.toAstToken(ctx._op),
            this.visitNode(ctx.condition(1))
        );
    }

    visitArithmeticBinaryExpression = (ctx: ArithmeticBinaryExpressionContext): Node => {
        return new ArithmeticExpression(
            this.location(ctx),
            this.visitNode(ctx.arithmetic(0)),
            this.toAstToken(ctx._op),
            this.visitNode(ctx.arithmetic(1))
        );
    }

    visitCalcExpression = (ctx: CalcExpressionContext): Node => {
        return new CalcExpression(this.location(ctx), this.visitNode(ctx.calc().arithmetic()));
    }

    visitCommandCallExpression = (ctx: CommandCallExpressionContext): Node => {
        const rawLists = ctx.expressionList();
        const lists = Array.isArray(rawLists) ? rawLists : rawLists ? [rawLists] : [];
        const args2 = ctx.MUL() !== null ? this.collectExpressionList(lists[1]) : null;

        return new CommandCallExpression(
            this.location(ctx),
            this.visitNode(ctx.identifier()),
            this.collectExpressionList(lists[0]),
            args2
        );
    }

    visitProcCallExpression = (ctx: ProcCallExpressionContext): Node => {
        const rawLists = ctx.expressionList();
        const lists = Array.isArray(rawLists) ? rawLists : rawLists ? [rawLists] : [];
        return new ProcCallExpression(
            this.location(ctx),
            this.visitNode(ctx.identifier()),
            this.collectExpressionList(lists[0])
        );
    }

    visitJumpCallExpression = (ctx: JumpCallExpressionContext): Node => {
        const rawLists = ctx.expressionList();
        const lists = Array.isArray(rawLists) ? rawLists : rawLists ? [rawLists] : [];
        return new JumpCallExpression(
            this.location(ctx),
            this.visitNode(ctx.identifier()),
            this.collectExpressionList(lists[0])
        );
    }

    visitClientScript = (ctx: ClientScriptContext): Node => {
        return new ClientScriptExpression(
            this.location(ctx),
            this.visitNode(ctx.identifier()),
            this.collectExpressionList(ctx._args),
            this.collectExpressionList(ctx._triggers)
        );
    }

    visitLocalVariable = (ctx: LocalVariableContext): Node => {
        return new LocalVariableExpression(this.location(ctx), this.visitNode(ctx.advancedIdentifier()), null);
    }

    visitLocalArrayVariable = (ctx: LocalArrayVariableContext): Node => {
        return new LocalVariableExpression(
            this.location(ctx),
            this.visitNode(ctx.advancedIdentifier()),
            this.extractParenthesisExpression(ctx.parenthesis())
        );
    }

    visitGameVariable = (ctx: GameVariableContext): Node => {
        const dot = ctx.DOTMOD() !== null;
        return new GameVariableExpression(this.location(ctx), dot, this.visitNode(ctx.advancedIdentifier()));
    }

    visitConstantVariable = (ctx: ConstantVariableContext): Node => {
        return new ConstantVariableExpression(this.location(ctx), this.visitNode(ctx.advancedIdentifier()));
    }

    visitIntegerLiteral = (ctx: IntegerLiteralContext): Node => {
        const text = ctx.getText();
        if (text.length > 1 && text[0] === "0" && (text[1] === "x" || text[1] === "X")) {
            return new IntegerLiteral(this.location(ctx), parseInt(text.slice(2), 16));
        }
        return new IntegerLiteral(this.location(ctx), parseInt(text, 10));
    }

    visitCoordLiteral = (ctx: CoordLiteralContext): Node => {
        const text = ctx.getText();
        const parts = text.split("_").map((part) => parseInt(part, 10));

        const x = (parts[1] << 6) | (parts[3] & 0x3fff);
        const z = (parts[2] << 6) | (parts[4] & 0x3fff);
        const y = parts[0] & 0x3;

        const packed = (z | (x << 14) | (y << 28)) | 0;
        return new CoordLiteral(this.location(ctx), packed);
    }

    visitBooleanLiteral = (ctx: BooleanLiteralContext): Node => {
        return new BooleanLiteral(this.location(ctx), ctx.getText() === "true");
    }

    visitCharacterLiteral = (ctx: CharacterLiteralContext): Node => {
        const cleaned = this.unescape(ctx.getText().slice(1, -1));
        if (cleaned.length !== 1) {
            throw new Error(`invalid character literal: text=${ctx.getText()}, cleaned=${cleaned}`);
        }
        return new CharacterLiteral(this.location(ctx), cleaned);
    }

    visitStringLiteral = (ctx: StringLiteralContext): Node => {
        return new StringLiteral(this.location(ctx), this.unescape(ctx.getText().slice(1, -1)));
    }

    visitNullLiteral = (ctx: NullLiteralContext): Node => {
        return new NullLiteral(this.location(ctx));
    }

    visitJoinedString = (ctx: JoinedStringContext): Node => {
        const parts: StringPart[] = [];

        for (const child of ctx.children ?? []) {
            if (child instanceof StringLiteralContentContext) {
                parts.push(new BasicStringPart(this.location(child), this.unescape(child.getText())));
            } else if (child instanceof StringTagContext) {
                parts.push(new BasicStringPart(this.location(child), child.getText()));
            } else if (child instanceof StringPTagContext) {
                parts.push(new PTagStringPart(this.location(child), child.getText()));
            } else if (child instanceof StringExpressionContext) {
                const expression = this.visitNode<Expression>(child.expression());
                parts.push(new ExpressionStringPart(this.location(child), expression));
            }
        }

        return new JoinedStringExpression(this.location(ctx), parts);
    }

    visitIdentifier = (ctx: IdentifierContext): Node => {
        return new Identifier(this.location(ctx), ctx.getText());
    }

    visitAdvancedIdentifier = (ctx: AdvancedIdentifierContext): Node => {
        return new Identifier(this.location(ctx), ctx.getText());
    }

    visitConditionNormalExpression = (ctx: ConditionNormalExpressionContext): Node => {
        return this.visitNode(ctx.expression());
    }

    visitArithmeticNormalExpression = (ctx: ArithmeticNormalExpressionContext): Node => {
        return this.visitNode(ctx.expression());
    }

    visitCallExpression = (ctx: CallExpressionContext): Node => {
        return this.visitNode(ctx.call());
    }

    visitIdentifierExpression = (ctx: IdentifierExpressionContext): Node => {
        return this.visitNode(ctx.identifier());
    }

    visitLiteralExpression = (ctx: LiteralExpressionContext): Node => {
        return this.visitNode(ctx.literal());
    }

    visitJoinedStringExpression = (ctx: JoinedStringExpressionContext): Node => {
        return this.visitNode(ctx.joinedString());
    }
  
    visitLocalVariableExpression = (ctx: LocalVariableExpressionContext): Node => {
        return this.visitNode(ctx.localVariable());
    }
  
    visitLocalArrayVariableExpression = (ctx: LocalArrayVariableExpressionContext): Node => {
        return this.visitNode(ctx.localArrayVariable());
    }
  
    visitGameVariableExpression = (ctx: GameVariableExpressionContext): Node => {
        return this.visitNode(ctx.gameVariable());
    }
  
    visitConstantVariableExpression = (ctx: ConstantVariableExpressionContext): Node => {
        return this.visitNode(ctx.constantVariable());
    }

    private location(ctx: ParserRuleContext): NodeSourceLocation {
        const stop = ctx.stop ?? ctx.start;
        return this.locationFromRange(ctx.start, stop);
    }

    /**
     * Helper to compute location 
     */
    private locationFromToken(token: AntlrToken): NodeSourceLocation {
        return this.locationFromRange(token, token);
    }

    private locationFromRange(start: AntlrToken, stop: AntlrToken): NodeSourceLocation {
        const startColumnOffset = start.line === 1 ? this.columnOffset : 0;
        const endColumnOffset = stop.line === 1 ? this.columnOffset : 0;
        const textLength = Math.max(stop.text?.length ?? 0, 1);
        return {
            name: this.source,
            line: start.line - 1 + this.lineOffset,
            column: start.column + startColumnOffset,
            endLine: stop.line - 1 + this.lineOffset,
            endColumn: stop.column + endColumnOffset + textLength,
        };
    }

    /**
     * Convert an ANTLR token into a AST token.
     */
    private toAstToken(token: AntlrToken): Token {
        return new Token(this.locationFromToken(token), token.text ?? "");
    }

    private visitNode<T extends Node>(ctx: ParserRuleContext | null | undefined): T {
        if (!ctx) {
            throw new Error("Expected parser context but recieved null/undefined.");
        }

        return this.visit(ctx) as T;
    }

    private collectExpressionList(ctx?: ExpressionListContext | null): Expression[] {
        if (!ctx) {
            return [];
        }
        const expressions = ctx.expression();
        const list = Array.isArray(expressions) ? expressions : [expressions];
        return list.map((expr) => this.visitNode<Expression>(expr));
    }

    private extractParenthesisExpression(ctx: ParenthesisContext): Expression {
        return this.visitNode<Expression>(ctx.expression());
    }

    /**
     * Replaces escape sequences in a string.
     *
     * @return The string with all escape sequences replaced.
     */
    private unescape(value: string): string {
        let result = "";
        for (let i = 0; i < value.length; i += 1) {
            const current = value[i];
            if (current === "\\") {
                const next = i === value.length - 1 ? "\\" : value[i + 1];
                if (next === "\\" || next === "'" || next === '"' || next === "<") {
                    result += next;
                } else {
                    throw new Error(`Unsupported escape sequence: \\${next}`);
                }
                i += 1;
          } else {
                result += current;
          }
        }
        return result;
    }
}