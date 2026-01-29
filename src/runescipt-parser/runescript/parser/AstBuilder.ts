import { ParseTreeVisitor } from 'antlr4ts/tree/ParseTreeVisitor';
import { Node } from '../ast/Node';
import { ParserRuleContext } from 'antlr4ts';
import { Token as AntlrToken } from 'antlr4ts';
import { NodeSourceLocation } from '../ast/NodeSourceLocation';
import { TerminalNode } from 'antlr4ts/tree/TerminalNode';
import { BlockStatementContext, ExpressionListContext, IfStatementContext, NullLiteralContext, ParameterContext, ParenthesisContext, ReturnStatementContext, ScriptContext, ScriptFileContext, SwitchCaseContext, SwitchStatementContext, WhileStatementContext } from '../../../antlr/out/RuneScriptParser';
import { Expression } from '../ast/expr/Expression';
import { ErrorNode } from 'antlr4ts/tree/ErrorNode';
import { RuleNode } from 'antlr4ts/tree/RuleNode';
import { Token } from '../ast/Token'
import { ScriptFile } from '../ast/ScriptFile';
import { Script } from '../ast/Scripts';
import { Parameter } from '../ast/Parameter';
import { Statement } from '../ast/statement/Statement';
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

/**
 * A visitor that converts an antlr parse tree into an [AST](https://en.wikipedia.org/wiki/Abstract_syntax_tree). See
 * [Node] implementations for all possible pieces of the tree.
 */
export class AstBuilder implements ParseTreeVisitor<Node> {
        private source: string;
        private lineOffset = 0;
        private columnOffset = 0
    constructor(
        source: string,
        lineoffset: number,
        columnOffset: number
    ) {
        this.source = source;
        this.lineOffset = lineoffset;
        this.columnOffset = columnOffset;
    }

    /**
     * Helper to compute location 
     */
    private getLocationFromNode(node: ParserRuleContext | AntlrToken | TerminalNode): NodeSourceLocation {
        let token: AntlrToken;
        if ('symbol' in node) {
            // TerminalNode
            token = node.symbol;
        } else if ('line' in node) {
            // Token
            token = node as AntlrToken;
        } else {
            // ParserRuleContext
            token = (node as ParserRuleContext).start;
        }

        const columnOffset = token.line === 1 ? this.columnOffset : 0;
        return new NodeSourceLocation(
            this.source,
            token.line + this.lineOffset,
            token.charPositionInLine + columnOffset + 1
        );
    }

    /**
     * Convert an ANTLR token into a NodeSourceLocation
     */
    tokenLocation(token: AntlrToken): NodeSourceLocation {
        return new NodeSourceLocation(
            this.source,
            token.line,
            token.charPositionInLine + 1
        );
    }

    /**
     * Convert an ANTLR token into a AST token.
     */
    antlrTokenToAstToken(token: AntlrToken): any {
        return { location: this.getLocationFromNode(token), text: token.text };
    }

    /**
     * Helpers to visit children 
     */
    public visit<T extends Node>(ctx: ParserRuleContext |TerminalNode | null): T | null {
        if (!ctx) return null;
        return (ctx as any).accept(this) as T;
    }

    public visistList<T extends Node>(ctxs: ParserRuleContext[] | null): T[] {
        if (!ctxs) return [];
        return ctxs.map((c) => this.visit<T>(c)!);
    }

    public visitExpressionList(ctx: ExpressionListContext | null): Expression[] {
        if (!ctx) return [];
        return ctx.expression().map((e) => this.visit<Expression>(e)!);
    }

    public visitStatements(ctx: ParserRuleContext[]): Statement[] {
        return ctx.map(c => c.accept(this) as Statement);
    }

    public visitParenthesis(ctx: ParenthesisContext): Expression {
        return this.visit<Expression>(ctx.expression())!;
    }

    /**
     * Replaces escape sequences in a string.
     *
     * @return The string with all escape sequences replaced.
     */
    public unescape(str: string): string {
        return str.replace(/\\(.)/g, (_match, char) => {
            switch (char) {
                case '\\':
                case '"':
                case "'":
                case '<':
                    return char;
                default:
                    throw new Error(`Unsupported escape sequence: \\${char}`);
            }
        });
    }

    /**
     * Default visitors
     */
    visitChildren(node: RuleNode): Node {
        let result: Node | null = null;
        for (let i = 0; i < node.childCount; i++) {
            const child =  node.getChild(i);
            const childResult = child.accept(this);
        }
        return result!;
    }

    visitTerminal(node: TerminalNode): Node {
        return new Token(this.tokenLocation(node.symbol), node.text);
    }

    visitErrorNode(node: ErrorNode): Node {
        throw new Error(`Error node encountered: ${node.text}`);
    }

    /**
     * Visitor methods
     */
    visitScriptFile(ctx: ScriptFileContext): ScriptFile {
        return new ScriptFile(
            this.getLocationFromNode(ctx),
            ctx.script().map(s => s.accept(this) as Script)
        );
    }

    visitScript(ctx: ScriptContext): Script {
        const returns = ctx.typeList()?.IDENTIFIER()?.map(t => this.antlrTokenToAstToken(t.symbol));

        return new Script(
            this.getLocationFromNode(ctx),
            ctx._trigger.accept(this) as any, // cast to Identifier
            ctx._name.accept(this) as any,
            !!ctx.MUL(),
            ctx.parameterList()?.parameter().map(p => p.accept(this) as Parameter),
            returns,
            ctx.statement().map(s => s.accept(this) as Statement)
        );
    }

    visitParameter(ctx: ParameterContext): Parameter {
        return new Parameter(
            this.getLocationFromNode(ctx),
            this.antlrTokenToAstToken(ctx._type),
            ctx.advancedIdentifier().accept(this) as any
        );
    }

    visitBlockStatement(ctx: BlockStatementContext): BlockStatement {
        return new BlockStatement(this.getLocationFromNode(ctx), this.visitStatements(ctx.statement()))
    }

    visitRetrunStatemant(ctx: ReturnStatementContext): ReturnStatement {
        return new ReturnStatement(this.getLocationFromNode(ctx), this.visitExpressionList(ctx.expressionList()));
    }

    visitIfStatement(ctx: IfStatementContext): IfStatement {
        return new IfStatement(
            this.getLocationFromNode(ctx),
            ctx.condition().accept(this) as Expression,
            ctx.statement(0).accept(this) as Statement,
            ctx.statement(1)?.accept(this) as Statement | null
        );
    }

    visitWhileStatement(ctx: WhileStatementContext): WhileStatement {
        return new WhileStatement(
            this.getLocationFromNode(ctx),
            ctx.condition().accept(this) as Expression,
            ctx.statement().accept(this) as Statement
        );
    }

    visitSwitchStatement(ctx: SwitchStatementContext): SwitchStatement {
        return new SwitchStatement(
            this.getLocationFromNode(ctx),
            this.antlrTokenToAstToken(ctx.SWITCH_TYPE().symbol),
            ctx.parenthesis().accept(this) as Expression,
            ctx.switchCase().map(c => c.accept(this) as SwitchCase)
        );
    }

    visitSwitchCase(ctx: SwitchCaseContext): SwitchCase {
        return new SwitchCase(
            this.getLocationFromNode(ctx),
            this.visitExpressionList(ctx.expressionList()),
            ctx.statement()?.map(s => s.accept(this) as Statement) ?? []
        );
    }

    visitDeclarationStatement(ctx: DeclarationStatementContext): DeclarationStatement {
        return new DeclarationStatement(
            this.getLocationFromNode(ctx),
            this.antlrTokenToAstToken(ctx.DEF_TYPE()),
            ctx.advancedIdentifier().accept(this) as any,
            ctx.expression()?.accept(this) as Expression | null
        );
    }

    visitArrayDeclarationStatement(ctx: ArrayDeclarationStatementContext): ArrayDeclarationStatement {
        return new ArrayDeclarationStatement(
            this.getLocationFromNode(ctx),
            this.antlrTokenToAstToken(ctx.DEF_TYPE()),
            ctx.advancedIdentifier().accept(this) as any,
            ctx.parenthesis().accept(this)
        );
    }

    visitAssignmentStatement(ctx: AssignmentStatementContext): AssignmentStatement {
        return new AssignmentStatement(
            this.getLocationFromNode(ctx),
            ctx.assignableVariableList().assignableVariable().map(v => v.accept(this) as LocalVariableExpression),
            this.visitExpressionList(ctx.expressionList)
        );
    }

    visitArithmeticBinaryExpression(ctx: ArithmeticBinaryExpressionContext): ArithmeticExpression {
        return new ArithmeticExpression(
            this.getLocationFromNode(ctx),
            ctx.arithmetic(0).accept(this) as Expression,
            this.antlrTokenToAstToken(ctx.op),
            ctx.arithmetic(1).accept(this) as Expression
        );
    }

    visitCalcExpression(ctx: CalcExpressionContext): CalcExpression {
        return new CalcExpression(this.getLocationFromNode(ctx), ctx.calc().arithmetic().accept(this) as Expression);
    }

    visitCommandCallExpression(ctx: CommandCallExpressionContext): CommandCallExpression {
        const args2 = ctx.MUL() ? ctx.expressionList(1)?.accept(this) as Expression[] ?? [] : null;
        return new CommandCallExpression(
            this.getLocationFromNode(ctx),
            ctx.identifier().accept(this) as any,
            ctx.expressionList(0).accept(this) as Expression[],
            args2
        );
    }

    visitProcCallExpression(ctx: ProcCallExpressionContext): ProcCallExpression {
        return new ProcCallExpression(
            this.getLocationFromNode(ctx),
            ctx.identifier().accept(this) as any,
            ctx.expressionList().accept(this) as Expression[]
        );
    }

    visitJumpCallExpression(ctx: JumpCallExpressionContext): JumpCallExpression {
        return new JumpCallExpression(
            this.getLocationFromNode(ctx),
            ctx.identifier().accept(this) as any,
            ctx.expressionList().accept(this) as Expression[]
        );
    }

    visitClientScript(ctx: ClientScriptContext): ClientScriptExpression {
        return new ClientScriptExpression(
            this.getLocationFromNode(ctx),
            ctx.identifier().accept(this) as any,
            ctx.args.accept(this) as Expression[],
            ctx.triggers.accept(this) as Expression[]
        );
    }

    visitLocalVariable(ctx: LocalVariableContext): LocalVariableExpression {
        return new LocalVariableExpression(
            this.getLocationFromNode(ctx),
            ctx.advancedIdentifier().accept(this) as any
        );
    }

    visitLocalArrayVariable(ctx: LocalArrayVariableContext): LocalVariableExpression {
        return new LocalVariableExpression(
            this.getLocationFromNode(ctx),
            ctx.advancedIdentifier().accept(this) as any,
            ctx.parenthesis().accept(this)
        );
    }

    visitGameVariable(ctx: GameVariableContext): GameVariableExpression {
        return new GameVariableExpression(
            this.getLocationFromNode(ctx),
            !!ctx.DOTMOD(),
            ctx.advancedIdentifier().accept(this) as any
        );
    }

    visitConstantVariable(ctx: ConstantVariableContext): ConstantVariableExpression {
        return new ConstantVariableExpression(this.getLocationFromNode(ctx), ctx.advancedIdentifier().accept(this) as any);
    }

    visitIntegerLiteral(ctx: IntegerLiteralContext): IntegerLiteral {
        let text = ctx.text;
        if (text.startsWith('0x') || text.startsWith('0X')) text = text.slice(2);
        return new IntegerLiteral(this.getLocationFromNode(ctx), parseInt(text, text.startsWith('0x') ? 16 : 10));
    }

    visitCoordLiteral(ctx: CoordLiteralContext): CoordLiteral {
        const parts = ctx.text.split('_').map(Number);
        const x = (parts[1] << 6) | parts[3] & 0x3fff;
        const z = (parts[2] << 6) | parts[4] & 0x3fff;
        const y = parts[0] & 0x3;
        const packed = z | (x << 14) | (y << 28);
        return new CoordLiteral(this.getLocationFromNode(ctx), packed);
    }

    visitBooleanLiteral(ctx: BooleanLiteralContext): BooleanLiteral {
        return new BooleanLiteral(this.getLocationFromNode(ctx), ctx.text === 'true');
    }

    visitCharacterLiteral(ctx: CharacterLiteralContext): CharacterLiteral {
        const cleaned = this.unescape(ctx.text.slice(1, -1));
        if (cleaned.length !== 1) throw new Error(`Invalid character literal: ${ctx.text}`);
        return new CharacterLiteral(this.getLocationFromNode(ctx), cleaned[0]);
    }

    visitStringLiteral(ctx: StringLiteralContext): StringLiteral {
        return new StringLiteral(this.getLocationFromNode(ctx), this.unescape(ctx.text.slice(1, -1)));
    }

    visitExpressionStatement(ctx: ExpressionStatementContext): ExpressionStatement {
        return new ExpressionStatement(this.getLocationFromNode(ctx), ctx.expression().accept(this) as Expression);
    }

    visitEmptyStatement(ctx: EmptyStatementContext): EmptyStatement {
        return new EmptyStatement(this.getLocationFromNode(ctx));
    }

    visitSingleExpression(ctx: SingleExpressionContext): SingleExpression {
        return ctx.expression().accept(this) as Expression;
    }

    visitParenthesizedExpression(ctx: ParenthesizedExpressionContext): ParenthesizedExpression {
        return new ParenthesizedExpression(this.getLocationFromNode(ctx), ctx.parenthesis().accept(this) as Expression);
    }

    visitConditionParenthesizedExpression(ctx: ConditionParenthesizedExpressionContext): ParenthesizedExpression {
        return new ParenthesizedExpression(this.getLocationFromNode(ctx), ctx.condition().accept(this) as Expression);
    }

    visitArithmeticParenthesizedExpression(ctx: ArithmeticParenthesizedExpressionContext): ParenthesizedExpression {
        return new ParenthesizedExpression(this.getLocationFromNode(ctx), ctx.arithmetic().accept(this) as Expression);
    }

    visitConditionBinaryExpression(ctx: ConditionBinaryExpressionContext): ConditionExpression {
        return new ConditionExpression(
            this.getLocationFromNode(ctx),
            ctx.condition(0).accept(this) as Expression,
            this.antlrTokenToAstToken(ctx.op),
            ctx.condition(1).accept(this) as Expression
        );
    }

    visitNullLiteral(ctx: NullLiteralContext): NullLiteral {
        return new NullLiteral(this.getLocationFromNode(ctx));
    }

    visitJoinedString(ctx: JoinedStringContext): JoinedStringExpression {
        const parts: StringPart[] = [];
        for (const child of ctx.children ?? []) {
            if (child instanceof StringLiteralContentContext) parts.push(new BasicStringPart(this.getLocationFromNode(child), this.unescape(child.text)));
            else if (child instanceof StringTagContext) parts.push(new BasicStringPart(this.getLocationFromNode(child), child.text));
            else if (child instanceof StringPTagContext) parts.push(new PTagStringPart(this.getLocationFromNode(child), child.text));
            else if (child instanceof StringExpressionContext) parts.push(new ExpressionStringPart(this.getLocationFromNode(child), child.expression().accept(this) as Expression));
        }
        return new JoinedStringExpression(this.getLocationFromNode(ctx), parts);
    }

    visitIdentifier(ctx: IdentifierContext | AdvancedIdentifierContext): any {
        return new Identifier(this.getLocationFromNode(ctx), ctx.text);
    }
}