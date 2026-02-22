import { ANTLRErrorListener, type ATNConfigSet, type BitSet, type DFA, type Parser, CharStream, RecognitionException, Recognizer } from 'antlr4ng';

import { AstVisitor } from '#/runescript-parser/ast/AstVisitor.js';
import { Node } from '#/runescript-parser/ast/Node.js';
import { ScriptFile } from '#/runescript-parser/ast/ScriptFile.js';
import { DynamicCommandHandler } from '#/runescript-compiler/configuration/command/DynamicCommandHandler.js';
import { Diagnostics } from '#/runescript-compiler/diagnostics/Diagnostics.js';
import { SymbolTable } from '#/runescript-compiler/symbol/SymbolTable.js';
import { TriggerManager } from '#/runescript-compiler/trigger/TriggerManager.js';
import { TriggerType } from '#/runescript-compiler/trigger/TriggerType.js';
import { PrimitiveType } from '#/runescript-compiler/type/PrimitiveType.js';
import { TypeManager } from '#/runescript-compiler/type/TypeManager.js';
import { Token } from '#/runescript-parser/ast/Token.js';
import { BasicSymbol, ConstantSymbol, LocalVariableSymbol, RuneScriptSymbol } from '#/runescript-compiler/symbol/Symbol.js';
import { ClientScriptSymbol, ScriptSymbol } from '#/runescript-compiler/symbol/ScriptSymbol.js';
import { Type } from '#/runescript-compiler/type/Type.js';
import { CommandTrigger } from '#/runescript-compiler/trigger/CommandTrigger.js';
import { MetaType } from '#/runescript-compiler/type/MetaType.js';
import { ArrayType } from '#/runescript-compiler/type/wrapped/ArrayType.js';
import { Expression } from '#/runescript-parser/ast/expr/Expression.js';
import { TupleType } from '#/runescript-compiler/type/TupleType.js';
import { DiagnosticMessage } from '#/runescript-compiler/diagnostics/DiagnosticMessage.js';
import { Identifier } from '#/runescript-parser/ast/expr/Identifier.js';
import { ExpressionStringPart, StringPart } from '#/runescript-parser/ast/expr/StringPart.js';
import { JoinedStringExpression } from '#/runescript-parser/ast/expr/JoinedStringExpression.js';
import { StringLiteral } from '#/runescript-parser/ast/expr/literal/StringLiteral.js';
import { ParserErrorListener } from '#/runescript-compiler/ParserErrorListener.js';
import { ScriptParser } from '#/runescript-parser/parser/ScriptParser.js';
import { RuneScriptParser } from '#/runescript-compiler/../antlr/RuneScriptParser.js';
import { ClientScriptExpression } from '#/runescript-parser/ast/expr/ClientScriptExpression.js';
import { NullLiteral } from '#/runescript-parser/ast/expr/literal/NullLiteral.js';
import { CharacterLiteral } from '#/runescript-parser/ast/expr/literal/CharacterLiteral.js';
import { BooleanLiteral } from '#/runescript-parser/ast/expr/literal/BooleanLiteral.js';
import { CoordLiteral } from '#/runescript-parser/ast/expr/literal/CoordLiteral.js';
import { IntegerLiteral } from '#/runescript-parser/ast/expr/literal/IntegerLiteral.js';
import { ConstantVariableExpression } from '#/runescript-parser/ast/expr/variable/ConstantVariableExpression.js';
import { SymbolType } from '#/runescript-compiler/symbol/SymbolType.js';
import { GameVariableExpression } from '#/runescript-parser/ast/expr/variable/GameVariableExpression.js';
import { GameVarType } from '#/runescript-compiler/type/wrapped/GameVarType.js';
import { CallExpression } from '#/runescript-parser/ast/expr/call/CallExpression.js';
import { LocalVariableExpression } from '#/runescript-parser/ast/expr/variable/LocalVariableExpression.js';
import { CommandCallExpression } from '#/runescript-parser/ast/expr/call/CommandCallExpression.js';
import { JumpCallExpression } from '#/runescript-parser/ast/expr/call/JumpCallExpression.js';
import { ProcCallExpression } from '#/runescript-parser/ast/expr/call/ProcCallExpression.js';
import { TypeCheckingContext } from '#/runescript-compiler/configuration/command/TypeCheckingContext.js';
import { Script } from '#/runescript-parser/ast/Scripts.js';
import { CalcExpression } from '#/runescript-parser/ast/expr/CalcExpression.js';
import { ArithmeticExpression } from '#/runescript-parser/ast/expr/ArithmeticExpression.js';
import { ConditionExpression } from '#/runescript-parser/ast/expr/ConditionExpression.js';
import { ParenthesizedExpression } from '#/runescript-parser/ast/expr/ParenthesizedExpression.js';
import { EmptyStatement } from '#/runescript-parser/ast/statement/EmptyStatement.js';
import { ExpressionStatement } from '#/runescript-parser/ast/statement/ExpressionStatement.js';
import { AssignmentStatement } from '#/runescript-parser/ast/statement/AssignmentStatement.js';
import { ArrayDeclarationStatement } from '#/runescript-parser/ast/statement/ArrayDeclarationStatement.js';
import { DeclarationStatement } from '#/runescript-parser/ast/statement/DeclarationStatement.js';
import { Literal } from '#/runescript-parser/ast/expr/literal/Literal.js';
import { SwitchCase } from '#/runescript-parser/ast/statement/SwitchCase.js';
import { SwitchStatement } from '#/runescript-parser/ast/statement/SwitchStatement.js';
import { WhileStatement } from '#/runescript-parser/ast/statement/WhileStatement.js';
import { IfStatement } from '#/runescript-parser/ast/statement/IfStatement.js';
import { ReturnStatement } from '#/runescript-parser/ast/statement/ReturnStatement.js';
import { BlockStatement } from '#/runescript-parser/ast/statement/BlockStatement.js';

/**
 * An implementation of [AstVisitor] that implements all remaining semantic/type
 * checking required to safely build scripts. This implementation assumes [PreTypeChecking]
 * is run beforehand.
 */
export class TypeChecking extends AstVisitor<void> {
    /**
     * The trigger that represents 'command'.
     */
    private readonly commandTrigger: TriggerType;

    /**
     * The trigger that represents `proc`.
     */
    private readonly procTrigger: TriggerType;

    /**
     * The trigger that represents `clientscript`. This trigger is optional.
     */
    private readonly clientscriptTrigger: TriggerType | null;

    /**
     * The trigger that represents `label`. This trigger is optional.
     */
    private readonly labelTrigger: TriggerType | null;

    /**
     * The current table. This is updated each time when entering a new script or block.
     */
    private table: SymbolTable;

    /**
     * A set of symbols that are currently being evaluated. Used to prevent re-entering
     * a constant and causing a stack overflow.
     */
    private readonly constantsBeingEvaluated: Set<RuneScriptSymbol>;

    constructor(
        protected readonly typeManager: TypeManager,
        protected readonly triggerManager: TriggerManager,
        protected readonly rootTable: SymbolTable,
        protected readonly dynamicCommands: Map<string, DynamicCommandHandler>,
        protected readonly diagnostics: Diagnostics
    ) {
        super();
        this.commandTrigger = this.triggerManager.find('command');
        this.procTrigger = this.triggerManager.find('proc');
        this.clientscriptTrigger = this.triggerManager.findOrNull('clientscript');
        this.labelTrigger = this.triggerManager.findOrNull('label');

        this.table = this.rootTable;

        this.constantsBeingEvaluated = new Set();
    }

    /**
     * Sets the active [table] to [newTable] and runs [block] then sets [table] back to what it was originally.
     */
    private scoped(newTable: SymbolTable, block: () => void): void {
        const oldTable = this.table;
        this.table = newTable;
        block();
        this.table = oldTable;
    }

    override visitScriptFile(scriptFile: ScriptFile): void {
        // Visit all scripts in the file.
        this.visitNodes(scriptFile.scripts);
    }

    override visitScript(script: Script): void {
        this.scoped(script.block, () => {
            /**
             * Visit all statements, we don't need to do anything else with the
             * script since all the other stuff is handled in pre-type checking.
             */
            this.visitNodes(script.statements);
        });
    }

    override visitBlockStatement(blockStatement: BlockStatement): void {
        this.scoped(blockStatement.scope, () => {
            // Visit all statements.
            this.visitNodes(blockStatement.statements);
        });
    }

    override visitReturnStatement(returnStatement: ReturnStatement): void {
        const script = returnStatement.findParentByType(Script);
        if (script == null) {
            /**
             * A return statement should always be within a script,
             * if not then we have problems!
             */
            returnStatement.reportError(this.diagnostics, DiagnosticMessage.RETURN_ORPHAN);
            return;
        }
        // Use the return types from the script node and get the types being returned.
        const expectedTypes = TupleType.toList(script.returnType);
        const actualTypes = this.typeHintExpressionList(expectedTypes, returnStatement.expressions);

        // Convert the types into a single type.
        const expectedType = TupleType.fromList(expectedTypes);
        const actualType = TupleType.fromList(actualTypes);

        // Type check
        this.checkTypeMatch(returnStatement, expectedType, actualType);
    }

    override visitIfStatement(ifStatement: IfStatement): void {
        this.checkCondition(ifStatement.condition);
        this.visitNodeOrNull(ifStatement.thenStatement);
        this.visitNodeOrNull(ifStatement.elseStatement);
    }

    override visitWhileStatement(whileStatement: WhileStatement): void {
        this.checkCondition(whileStatement.condition);
        this.visitNodeOrNull(whileStatement.thenStatement);
    }

    /**
     * Handles type hinting and visiting the expression, then checking if it is a valid conditional
     * expression. If the condition returns anything other than `boolean`, or is not a valid
     * condition expression, an error is emitted.
     */
    private checkCondition(expression: Expression) {
        // Type hint and visit condition.
        expression.typeHint = PrimitiveType.BOOLEAN;

        // Attempts to find the first expression that isn't a binary expression or parenthesis expression.
        const invalidExpression = this.findInvalidConditionExpression(expression);
        if (invalidExpression == null) {
            /**
             * Visit expression and type check it, we don't visit outside this because we don't want
             * to report type mistmatches AND invalid condition at the same time.
             */
            this.visitNodeOrNull(expression);
            this.checkTypeMatch(expression, PrimitiveType.BOOLEAN, expression.type ?? MetaType.Error);
        } else {
            // Report invalid condition expression on the erroneous node.
            invalidExpression.reportError(this.diagnostics, DiagnosticMessage.CONDITION_INVALID_NODE_TYPE);
        }
    }

    /**
     * Finds the first [Expression] node in the tree that is not either a [BinaryExpression] or
     * [ParenthesizedExpression]. If `null` is returned then that means the whole tree is valid
     * is all valid conditional expressions.
     */
    private findInvalidConditionExpression(expression: Expression): Node | null {
        if (expression instanceof ConditionExpression) {
            const op = expression.operator.text;
            if (op === '|' || op === '&') {
                /**
                 * Check the left side and return it if it isn't null, otherwise
                 * return the value of the right side.
                 */
                return this.findInvalidConditionExpression(expression.left) ?? this.findInvalidConditionExpression(expression.right);
            } else {
                // All other operators are valid.
                return null;
            }
        } else if (expression instanceof ParenthesizedExpression) {
            return this.findInvalidConditionExpression(expression.expression);
        } else {
            return expression;
        }
    }

    override visitSwitchStatement(switchStatement: SwitchStatement): void {
        const expectedType = switchStatement.type;

        // Type hint the condition and visit it.
        const condition = switchStatement.condition;
        condition.typeHint = expectedType;
        this.visitNodeOrNull(condition);
        this.checkTypeMatch(condition, expectedType, condition.type ?? MetaType.Error);

        /**
         * TODO: Check for duplicate case lables (other than default).
         * Visit all the cases, cases will be type checked here.
         */
        let defaultCase: SwitchCase | null = null;
        for (const caseEntry of switchStatement.cases) {
            if (caseEntry.isDefault) {
                if (defaultCase == null) {
                    defaultCase = caseEntry;
                } else {
                    caseEntry.reportError(this.diagnostics, DiagnosticMessage.SWITCH_DUPLICATE_DEFAULT);
                }
            }
            this.visitNodeOrNull(caseEntry);
        }
        switchStatement.defaultCase = defaultCase;
    }

    override visitSwitchCase(switchCase: SwitchCase): void {
        const parentSwitch = switchCase.findParentByType(SwitchStatement);
        if (!parentSwitch) {
            switchCase.reportError(this.diagnostics, DiagnosticMessage.CASE_WITHOUT_SWITCH);
            return;
        }
        const switchType = parentSwitch.type;

        // Visit the case keys
        for (const key of switchCase.keys) {
            // Type hint and visit so we can access more information in constant expression check.
            key.typeHint = switchType;
            this.visitNodeOrNull(key);

            if (!this.isConstantExpression(key)) {
                key.reportError(this.diagnostics, DiagnosticMessage.SWITCH_CASE_NOT_CONSTANT);
                continue;
            }

            // Expression is a constant, now we need to verify the types match.
            this.checkTypeMatch(key, switchType, key.type);
        }

        this.scoped(switchCase.scope, () => {
            // Visit the statements.
            this.visitNodes(switchCase.statements);
        });
    }

    /**
     * Checks if the result of [expression] is known at compile time.
     */
    public isConstantExpression(expression: Expression): boolean {
        if (expression instanceof ConstantVariableExpression) {
            return true;
        }

        if (expression instanceof StringLiteral) {
            /**
             * We need to special case this since it's possible for a string literal to have been
             * transformed intoa another expression tpye (e.g graphic or clientscript).
             */
            const sub = expression.subExpression;
            return sub == null || this.isConstantExpression(sub);
        }

        if (expression instanceof Literal) {
            return true;
        }

        if (expression instanceof Identifier) {
            const ref = expression.reference;
            return ref == null || this.isConstantSymobl(ref);
        }

        return false;
    }

    /**
     * Checks if the value of [symbol] is known at compile time.
     */
    private isConstantSymobl(symbol: RuneScriptSymbol): boolean {
        return symbol instanceof BasicSymbol || symbol instanceof ConstantSymbol;
    }

    override visitDeclarationStatement(declarationStatement: DeclarationStatement): void {
        const typeName = declarationStatement.typeToken.text.replace(/^def_/, '');
        const name = declarationStatement.name.text;
        const type = this.typeManager.findOrNull(typeName);

        // Notify invalid type.
        if (!type) {
            declarationStatement.typeToken.reportError(this.diagnostics, DiagnosticMessage.GENERIC_INVALID_TYPE, typeName);
        } else if (type.options && !type.options.allowDeclaration) {
            declarationStatement.typeToken.reportError(this.diagnostics, DiagnosticMessage.LOCAL_DECLARATION_INVALID_TYPE, type.representation);
        }

        // Attempt to insert the local variable into the symbol table and display error if failed to insert.
        const symbol = new LocalVariableSymbol(name, type ?? MetaType.Error);
        const inserted = this.table.insert(SymbolType.localVariable(), symbol);
        if (!inserted) {
            declarationStatement.name.reportError(this.diagnostics, DiagnosticMessage.SCRIPT_LOCAL_REDECLARATION, name);
        }

        // Visit the initializer if it exists to resolve references in it.
        const initializer = declarationStatement.initializer;
        if (initializer != null) {
            // Type hint that we want whatever the declaration type is then visit.
            initializer.typeHint = symbol.type;
            this.visitNodeOrNull(initializer);
            this.checkTypeMatch(initializer, symbol.type, initializer.type ?? MetaType.Error);
        }
        declarationStatement.symbol = symbol;
    }

    override visitArrayDeclarationStatement(arrayDeclarationStatement: ArrayDeclarationStatement): void {
        const typeName = arrayDeclarationStatement.typeToken.text.replace(/^def_/, '');
        const name = arrayDeclarationStatement.name.text;
        let type = this.typeManager.findOrNull(typeName);

        // Notify invalid type.
        if (!type) {
            arrayDeclarationStatement.typeToken.reportError(this.diagnostics, DiagnosticMessage.GENERIC_INVALID_TYPE, typeName);
        } else if (type.options && !type.options.allowDeclaration) {
            arrayDeclarationStatement.typeToken.reportError(this.diagnostics, DiagnosticMessage.LOCAL_DECLARATION_INVALID_TYPE, type.representation);
        } else if (type.options && !type.options.allowArray) {
            arrayDeclarationStatement.typeToken.reportError(this.diagnostics, DiagnosticMessage.LOCAL_ARRAY_INVALID_TYPE, type.representation);
        }

        if (type) {
            // Wrap in an array type when valid.
            type = new ArrayType(type);
        } else {
            // Use error type when the base type is invalid.
            type = MetaType.Error;
        }

        // Visit the initializer if it exists to resolve references in it.
        const initializer = arrayDeclarationStatement.initializer;
        initializer.typeHint = PrimitiveType.INT;
        this.visitNodeOrNull(initializer);
        this.checkTypeMatch(initializer, PrimitiveType.INT, initializer.type ?? MetaType.Error);

        // Attempt to insert the local variable into the symbol table and display error if failed to insert.
        const symbol = new LocalVariableSymbol(name, type);
        const inserted = this.table.insert(SymbolType.localVariable(), symbol);
        if (!inserted) {
            arrayDeclarationStatement.name.reportError(this.diagnostics, DiagnosticMessage.SCRIPT_LOCAL_REDECLARATION, name);
        }

        arrayDeclarationStatement.symbol = symbol;
    }

    override visitAssignmentStatement(assignmentStatement: AssignmentStatement): void {
        const vars = assignmentStatement.vars;

        // Visist the lhs to fetch the references.
        this.visitNodes(vars);

        // Store the lhs types to help with the type hinting.
        const leftTypes = vars.map(v => this.getSafeType(v));
        const rightTypes = this.typeHintExpressionList(leftTypes, assignmentStatement.expressions).map(t => t ?? MetaType.Error);

        // Convert types to [TupleType] if necessary for easy comparison.
        const leftType = TupleType.fromList(leftTypes);
        const rightType = TupleType.fromList(rightTypes);

        this.checkTypeMatch(assignmentStatement, leftType, rightType);

        // Prevent multi-assignment involving arrays.
        const firstArrayReference = vars.find(v => v instanceof LocalVariableExpression && v.isArray);
        if (vars.length > 1 && firstArrayReference) {
            firstArrayReference.reportError(this.diagnostics, DiagnosticMessage.ASSIGN_MULTI_ARRAY);
        }
    }

    override visitExpressionStatement(expressionStatement: ExpressionStatement): void {
        // Just visit the inside expression.
        this.visitNodeOrNull(expressionStatement.expression);
    }

    override visitEmptyStatement(emptyStatement: EmptyStatement): void {
        // NO-OP
    }

    override visitParenthesizedExpression(parenthesizedExpression: ParenthesizedExpression): void {
        const innerExpression = parenthesizedExpression.expression;

        // Relay the type hint to the inner expression and visit it.
        innerExpression.typeHint = parenthesizedExpression.typeHint;
        this.visitNodeOrNull(innerExpression);

        // Set the type to the type of what the expression evaluates to.
        parenthesizedExpression.type = innerExpression.type;
    }

    override visitConditionExpression(conditionExpression: ConditionExpression): void {
        const left = conditionExpression.left;
        const right = conditionExpression.right;
        const operator = conditionExpression.operator;

        // Check for validation based on if we're within 'calc' or 'condition'.
        const validOperation = this.checkBinaryConditionOperation(left, operator, right);

        // Early return if it isn't a valid operation.
        if (!validOperation) {
            conditionExpression.type = MetaType.Error;
            return;
        }

        // Conditions expect boolean.
        conditionExpression.type = PrimitiveType.BOOLEAN;
    }

    /**
     * Verified the binary expression is a valid condition operation.
     */
    private checkBinaryConditionOperation(left: Expression, operator: Token, right: Expression): boolean {
        // Some operators expect a specific type on both sides, specify those type(s) here.
        let allowedTypes: Type[] | null;

        switch (operator.text) {
            case '&':
            case '|':
                allowedTypes = TypeChecking.ALLOWED_LOGICAL_TYPES;
                break;
            case '<':
            case '>':
            case '<=':
            case '>=':
                allowedTypes = TypeChecking.ALLOWED_RELATIONAL_TYPES;
                break;
            default:
                allowedTypes = null;
        }

        /**
         * If required type is set we should hint with those, otherwise use the opposite
         * sides type as a hint.
         */
        if (allowedTypes != null) {
            left.typeHint = allowedTypes[0];
            right.typeHint = allowedTypes[0];
        } else {
            // Assign the type hints using the opposite side if it isn't already assigned.
            left.typeHint = left.typeHint ?? right.type ?? null;
            right.typeHint = right.typeHint ?? left.type ?? null;
        }

        /**
         * TODO: Better logic for this to allow things such as 'if (null ! $var)', should also revisit the above.
         * Visit left side to get the type for hinting to the right side if needed.
         */
        this.visitNodeOrNull(left);

        // Type hint right if not already hinted to the left type and then visit.
        right.typeHint = right.typeHint ?? left.type;
        this.visitNodeOrNull(right);

        // Ensure both types are set, otherwise report error and return false.
        if (left.type == null || right.type == null) {
            operator.reportError(this.diagnostics, DiagnosticMessage.BINOP_INVALID_TYPES, operator.text, left.type ? left.type.representation : '<null>', right.type ? right.type.representation : '<null>');
            return false;
        }

        // Verify the left and right type only return 1 type that is not 'unit'.
        if (left.type instanceof TupleType || right.type instanceof TupleType) {
            if (left.type instanceof TupleType) {
                left.reportError(this.diagnostics, DiagnosticMessage.BINOP_TUPLE_TYPE, 'Left', left.type.representation);
            }
            if (right.type instanceof TupleType) {
                right.reportError(this.diagnostics, DiagnosticMessage.BINOP_TUPLE_TYPE, 'Right', right.type.representation);
            }
            return false;
        } else if (left.type == MetaType.Unit || right.type == MetaType.Unit) {
            operator.reportError(this.diagnostics, DiagnosticMessage.BINOP_INVALID_TYPES, operator.text, left.type.representation, right.type.representation);
            return false;
        }

        // Handle operator specific required types, this applies to all except '!' and '='.
        if (allowedTypes != null) {
            if (!this.checkTypeMatchAny(left, allowedTypes, left.type) || !this.checkTypeMatchAny(right, allowedTypes, right.type)) {
                operator.reportError(this.diagnostics, DiagnosticMessage.BINOP_INVALID_TYPES, operator.text, left.type.representation, right.type.representation);
                return false;
            }
        }

        // Handle equality operator, which allows any type on either side as long as they match.
        if (!this.checkTypeMatch(left, left.type, right.type, false)) {
            operator.reportError(this.diagnostics, DiagnosticMessage.BINOP_INVALID_TYPES, operator.text, left.type.representation, right.type.representation);
            return false;
        } else if (left.type == PrimitiveType.STRING && right.type == PrimitiveType.STRING) {
            operator.reportError(this.diagnostics, DiagnosticMessage.BINOP_INVALID_TYPES, operator.text, left.type.representation, right.type.representation);
            return false;
        }

        // Other cases are true.
        return true;
    }

    override visitArithmeticExpression(arithmeticExpression: ArithmeticExpression): void {
        const left = arithmeticExpression.left;
        const right = arithmeticExpression.right;
        const operator = arithmeticExpression.operator;

        // Arithmetic expression only expect 'int' or 'long' return types, but just allow.
        const expectedType = arithmeticExpression.typeHint ?? PrimitiveType.INT;

        // Visit left-hand side.
        left.typeHint = expectedType;
        this.visitNodeOrNull(left);

        // Visit right-hand side.
        right.typeHint = expectedType;
        this.visitNodeOrNull(right);

        // Verify if both sides are 'int' or 'long' and are of the same type.
        if (
            left.type == null ||
            right.type == null ||
            !this.checkTypeMatchAny(left, TypeChecking.ALLOWED_ARITHMETIC_TYPES, left.type ?? MetaType.Error) ||
            !this.checkTypeMatchAny(left, TypeChecking.ALLOWED_ARITHMETIC_TYPES, right.type ?? MetaType.Error) ||
            !this.checkTypeMatch(left, expectedType, left.type ?? MetaType.Error, false) ||
            !this.checkTypeMatch(right, expectedType, right.type ?? MetaType.Error, false)
        ) {
            operator.reportError(this.diagnostics, DiagnosticMessage.BINOP_INVALID_TYPES, operator.text, left.type ? left.type.representation : '<null>', right.type ? right.type.representation : '<null>');
            arithmeticExpression.type = MetaType.Error;
            return;
        }

        arithmeticExpression.type = expectedType;
    }

    override visitCalcExpression(calcExpression: CalcExpression): void {
        const typeHint = calcExpression.typeHint ?? PrimitiveType.INT;
        const innerExpression = calcExpression.expression;

        // Hint to the expression that we expect an 'int'.
        innerExpression.typeHint = typeHint;
        this.visitNodeOrNull(innerExpression);

        // Verify type is an 'int'.
        if (innerExpression.type == null || !this.checkTypeMatchAny(innerExpression, TypeChecking.ALLOWED_ARITHMETIC_TYPES, innerExpression.type ?? MetaType.Error)) {
            innerExpression.reportError(this.diagnostics, DiagnosticMessage.ARITHMETIC_INVALID_TYPE, innerExpression.type ? innerExpression.type.representation : '<null>');
            calcExpression.type = MetaType.Error;
        } else {
            calcExpression.type = innerExpression.type;
        }
    }

    override visitCommandCallExpression(commandCallExpression: CommandCallExpression): void {
        const name = commandCallExpression.nameString;

        // Attempt to call the dynamic command handlers type checker (if one exists).
        if (this.checkDynamicCommand(name, commandCallExpression)) {
            return;
        }

        // Check the command call.
        this.checkCallExpression(commandCallExpression, this.commandTrigger, DiagnosticMessage.COMMAND_REFERENCE_UNRESOLVED);
    }

    override visitProcCallExpression(procCallExpression: ProcCallExpression): void {
        // Check the proc call.
        this.checkCallExpression(procCallExpression, this.procTrigger, DiagnosticMessage.PROC_REFERENCE_UNRESOLVED);
    }

    override visitJumpCallExpression(jumpCallExpression: JumpCallExpression): void {
        if (!this.labelTrigger) {
            jumpCallExpression.reportError(this.diagnostics, 'Jump expression not allowed.');
            return;
        }

        const currentScript = jumpCallExpression.findParentByType(Script);
        if (!currentScript) throw new Error('Parent script not found.');

        if (currentScript.triggerType === this.procTrigger) {
            jumpCallExpression.reportError(this.diagnostics, 'Unable to jump to labels from within a proc.');
            return;
        }

        // Check the jump call.
        this.checkCallExpression(jumpCallExpression, this.labelTrigger, DiagnosticMessage.JUMP_REFERENCE_UNRESOLVED);
    }

    /**
     * Runs the type checking for dynamic command if one exists with [name].
     */
    private checkDynamicCommand(name: string, expression: Expression): boolean {
        const dynamicCommand = this.dynamicCommands.get(name);
        if (!dynamicCommand) return false;

        (() => {
            // Invoke the custom command type checking
            const context = new TypeCheckingContext(this, this.typeManager, expression, this.diagnostics);
            dynamicCommand.typeCheck(context);

            // Verify tye type has been set.
            if (!expression.getNullableType()) {
                expression.reportError(this.diagnostics, DiagnosticMessage.CUSTOM_HANDLER_NOTYPE);
            }

            // If the symbol was not manually specified, attempt to look up a predefined one.
            const needsSymbol = (expression instanceof Identifier && !expression.reference) || (expression instanceof CallExpression && !expression.symbol);

            if (needsSymbol) {
                const symbol = this.rootTable.find(SymbolType.serverScript(this.commandTrigger), name);
                if (!symbol) {
                    expression.reportError(this.diagnostics, DiagnosticMessage.CUSTOM_HANDLER_NOSYMBOL);
                }

                if (expression instanceof Identifier) {
                    expression.reference = symbol;
                } else if (expression instanceof CallExpression) {
                    expression.symbol = symbol;
                }
            }
        })();

        return true;
    }

    /**
     * Handles looking up and type checking all call expressions.
     */
    private checkCallExpression(call: CallExpression, trigger: TriggerType, unresolvedSymbolMessage: string): void {
        // Lookup the symbol using the symbol type and name.
        const name = call.name.text;
        const symbolType = SymbolType.serverScript(trigger);
        const symbol = this.rootTable.find(symbolType, name) as ScriptSymbol | null;

        if (!symbol) {
            call.type = MetaType.Error;
            call.reportError(this.diagnostics, unresolvedSymbolMessage, name);
        } else {
            call.symbol = symbol;
            call.type = symbol.returns;
        }

        // Verify the arguments are all valid.
        this.typeCheckArguments(symbol, call, name);
    }

    override visitClientScriptExpression(clientScriptExpression: ClientScriptExpression): void {
        if (!this.clientscriptTrigger) {
            clientScriptExpression.reportError(this.diagnostics, DiagnosticMessage.TRIGGER_TYPE_NOT_FOUND, 'clientscript');
            return;
        }

        const typeHint = clientScriptExpression.typeHint;
        if (!(typeHint instanceof MetaType.Hook)) {
            throw new Error('Expected MetaType Hook');
        }

        // Lookup the symbol by name.
        const name = clientScriptExpression.name.text;
        const symbolType = SymbolType.clientScript(this.clientscriptTrigger);
        const symbol = this.rootTable.find(symbolType, name) as ClientScriptSymbol | null;

        // Verify the clientscript exists.
        if (!symbol) {
            clientScriptExpression.reportError(this.diagnostics, DiagnosticMessage.CLIENTSCRIPT_REFERENCE_UNRESOLVED, name);
            clientScriptExpression.type = MetaType.Error;
        } else {
            clientScriptExpression.symbol = symbol;
            clientScriptExpression.type = typeHint;
        }

        // Verify arguments are all valid.
        this.typeCheckArguments(symbol, clientScriptExpression, name);

        // Disallow transmit list when not expected.
        const transmitListType = typeHint.transmitListType;
        if (transmitListType == MetaType.Unit && clientScriptExpression.transmitList.length > 0) {
            clientScriptExpression.transmitList[0].reportError(this.diagnostics, DiagnosticMessage.HOOK_TRANSMIT_LIST_UNEXPECTED);
            clientScriptExpression.type = MetaType.Error;
            return;
        }

        for (const expr of clientScriptExpression.transmitList) {
            expr.typeHint = transmitListType;
            this.visitNodeOrNull(expr);
            this.checkTypeMatch(expr, transmitListType, expr.type ?? MetaType.Error);
        }
    }

    /**
     * Verifies that [callExpression] arguments match the parameter types from [symbol].
     */
    private typeCheckArguments(symbol: ScriptSymbol | null, callExpression: CallExpression, name: string): void {
        /**
         * Type check the parameters, use `unit` if there are no parameters.
         * We will display a special message if the parameter ends up having `unit`
         * as the type but arguments are supplied.
         *
         * If the symbol is null then that means we failed to look up the symbol,
         * therefore we should specify the parameter types as error, so we can continue
         * analysis on all the arguments without worrying about a type mismatch.
         */
        const parameterTypes = symbol?.parameters ?? MetaType.Error;
        const expectedTypes = parameterTypes instanceof TupleType ? [...parameterTypes.children] : [parameterTypes];

        const actualTypes = this.typeHintExpressionList(expectedTypes, callExpression.arguments);

        // Convert the type lists into a singular type, used for type checking.
        const expectedType = TupleType.fromList(expectedTypes);
        const actualType = TupleType.fromList(actualTypes);

        // Special case for the temporary state of using `unit` for no arguments.
        if (expectedType == MetaType.Unit && actualType != MetaType.Unit) {
            let errorMessage: string;

            if (callExpression instanceof CommandCallExpression) {
                errorMessage = DiagnosticMessage.COMMAND_NOARGS_EXPECTED;
            } else if (callExpression instanceof ProcCallExpression) {
                errorMessage = DiagnosticMessage.PROC_NOARGS_EXPECTED;
            } else if (callExpression instanceof JumpCallExpression) {
                errorMessage = DiagnosticMessage.JUMP_NOARGS_EXPECTED;
            } else if (callExpression instanceof ClientScriptExpression) {
                errorMessage = DiagnosticMessage.CLIENTSCRIPT_NOARGS_EXPECTED;
            } else {
                throw new Error(`Unexpected callExpression type: ${callExpression}`);
            }

            callExpression.reportError(this.diagnostics, errorMessage, name, actualType.representation);
            return;
        }

        // Do the actual type checking.
        this.checkTypeMatch(callExpression, expectedType, actualType);
    }

    /**
     * Type check the index value of expression if it is defined.
     */
    override visitLocalVariableExpression(localVariableExpression: LocalVariableExpression): void {
        const name = localVariableExpression.name.text;
        const symbol = this.table.find(SymbolType.localVariable(), name) as LocalVariableSymbol | null;
        if (!symbol) {
            // Trying to reference a variable that isn't defined.
            localVariableExpression.reportError(this.diagnostics, DiagnosticMessage.LOCAL_REFERENCE_UNRESOLVED, name);
            localVariableExpression.type = MetaType.Error;
            return;
        }

        const symbolIsArray = symbol.type instanceof ArrayType;
        if (!symbolIsArray && localVariableExpression.isArray) {
            // Trying to reference non-array local variable and specifying an index.
            localVariableExpression.reportError(this.diagnostics, DiagnosticMessage.LOCAL_REFERENCE_NOT_ARRAY, name);
            localVariableExpression.type = MetaType.Error;
            return;
        }

        if (symbolIsArray && !localVariableExpression.isArray) {
            // Trying to reference array variable without specifying index in which to access.
            localVariableExpression.reportError(this.diagnostics, DiagnosticMessage.LOCAL_ARRAY_REFERENCE_NOINDEX, name);
            localVariableExpression.type = MetaType.Error;
            return;
        }

        const indexExpression = localVariableExpression.index;
        if (symbol.type instanceof ArrayType && indexExpression != null) {
            // Visit the index to set the type of any references.
            this.visitNodeOrNull(indexExpression);
            this.checkTypeMatch(indexExpression, PrimitiveType.INT, indexExpression.type ?? MetaType.Error);
        }

        localVariableExpression.reference = symbol;
        localVariableExpression.type = symbol.type instanceof ArrayType ? symbol.type.inner : symbol.type;
    }

    override visitGameVariableExpression(gameVariableExpression: GameVariableExpression): void {
        const name = gameVariableExpression.name.text;
        const symbol = this.rootTable.findAll<BasicSymbol>(name).find(sym => sym.type instanceof GameVarType);

        if (!symbol || !(symbol.type instanceof GameVarType)) {
            gameVariableExpression.type = MetaType.Error;
            gameVariableExpression.reportError(this.diagnostics, DiagnosticMessage.GAME_REFERENCE_UNRESOLVED, name);
            return;
        }

        gameVariableExpression.reference = symbol;
        gameVariableExpression.type = symbol.type.inner;
    }

    override visitConstantVariableExpression(constantVariableExpression: ConstantVariableExpression): void {
        const name = constantVariableExpression.name.text;

        // Constants rely on having a type to parse the constant value for.
        const typeHint = constantVariableExpression.typeHint;
        if (!typeHint) {
            constantVariableExpression.reportError(this.diagnostics, DiagnosticMessage.CONSTANT_UNKNOWN_TYPE, name);
            constantVariableExpression.type = MetaType.Error;
            return;
        } else if (typeHint == MetaType.Error) {
            /**
             * Avoid attempting to parse the constant if it was type hinted to error.
             * This is safe because if the hint type is error that means an error happened
             * elsewhere so an error will have been reported.
             */
            constantVariableExpression.type = MetaType.Error;
            return;
        }

        // Lookup the constant.
        const symbol = this.rootTable.find(SymbolType.constant(), name) as ConstantSymbol;
        if (!symbol) {
            constantVariableExpression.reportError(this.diagnostics, DiagnosticMessage.CONSTANT_REFERENCE_UNRESOLVED, name);
            constantVariableExpression.type = MetaType.Error;
            return;
        }

        // Check if we're trying to evaluate a constant that is still being evaluated.
        if (this.constantsBeingEvaluated.has(symbol)) {
            // Create a stack string and append the symbol that was the start of the loop to it.
            let stack = Array.from(this.constantsBeingEvaluated)
                .map(it => `^${it.name}`)
                .join(' -> ');

            stack += ` -> ^${symbol.name}`;
            constantVariableExpression.reportError(this.diagnostics, DiagnosticMessage.CONSTANT_CYCLIC_REF, stack);
            constantVariableExpression.type = MetaType.Error;
            return;
        }

        // Add the symbol to the set of constants being evalutated.
        this.constantsBeingEvaluated.add(symbol);

        try {
            // Base the source information on the string literal.
            const { name, line, column } = constantVariableExpression.source;

            // Check if the expected type is a string type.
            const graphicType = this.typeManager.findOrNull('graphic');
            const stringExpected = typeHint == PrimitiveType.STRING || (graphicType != null && typeHint == graphicType);

            const stream = CharStream.fromString(symbol.value);
            stream.name = name;
            const parsedExpression: Expression | null = stringExpected
                ? new StringLiteral({ name, line: line - 1, column: column - 1, endLine: line - 1, endColumn: column }, symbol.value)
                : (ScriptParser.invokeParser(stream, parser => parser.singleExpression(), TypeChecking.DISCARD_ERROR_LISTENER, line - 1, column - 1) as Expression | null);

            // Verify that the expression is parsed properly.
            if (!parsedExpression) {
                constantVariableExpression.reportError(this.diagnostics, DiagnosticMessage.CONSTANT_PARSE_ERROR, symbol.value, typeHint.representation);
                constantVariableExpression.type = MetaType.Error;
                return;
            }

            // Type hint the parsed expression to the expected type and then visit it.
            parsedExpression.typeHint = typeHint;
            this.visitNodeOrNull(parsedExpression);

            // Verify the constant evaluates to a constant expression (No macros!).
            if (!this.isConstantExpression(parsedExpression)) {
                constantVariableExpression.reportError(this.diagnostics, DiagnosticMessage.CONSTANT_NONCONSTANT, symbol.value);
                constantVariableExpression.type = MetaType.Error;
                return;
            }

            // Set the sub-expresssion to the parser expression and the type to the parsed expressions type.
            constantVariableExpression.subExpression = parsedExpression;
            constantVariableExpression.type = parsedExpression.type;
        } finally {
            // Remove the symbol from the set since it is no longer being evaluated.
            this.constantsBeingEvaluated.delete(symbol);
        }
    }

    override visitIntegerLiteral(integerLiteral: IntegerLiteral): void {
        integerLiteral.type = PrimitiveType.INT;
    }

    override visitCoordLiteral(coordLiteral: CoordLiteral): void {
        coordLiteral.type = PrimitiveType.COORD;
    }

    override visitBooleanLiteral(booleanLiteral: BooleanLiteral): void {
        booleanLiteral.type = PrimitiveType.BOOLEAN;
    }

    override visitCharacterLiteral(characterLiteral: CharacterLiteral): void {
        characterLiteral.type = PrimitiveType.CHAR;
    }

    override visitNullLiteral(nullLiteral: NullLiteral): void {
        const hint = nullLiteral.typeHint;
        if (hint != null) {
            // Infer the type if the hint base type is an 'int' OR 'long'.
            nullLiteral.type = hint;
            return;
        }
        nullLiteral.type = PrimitiveType.INT;
    }

    override visitStringLiteral(stringLiteral: StringLiteral): void {
        const hint = stringLiteral.typeHint;

        /**
         * These ugle conditions are here to enable special cases.
         * 1) If the hint is a hook.
         * 2) If the hint is not a string, and not any of the other types
         *    representable by a literal expression. It shoould be possible to
         *    reference a symbol via quoting it, this enables the ability to reference
         *    a symbol without it being a valid identifier.
         */
        if (!hint || this.typeManager.check(hint, PrimitiveType.STRING)) {
            /**
             * Early check if string is assignable to hint.
             * This mostly exists for when the expected type is `any`, we just
             * treat it as a string.
             */
            stringLiteral.type = PrimitiveType.STRING;
        } else if (hint instanceof MetaType.Hook) {
            this.handleClientScriptExpression(stringLiteral, hint);
        } else if (!TypeChecking.LITERAL_TYPES.has(hint)) {
            stringLiteral.symbol = this.resolveSymbol(stringLiteral, stringLiteral.value, hint);
        } else {
            stringLiteral.type = PrimitiveType.STRING;
        }
    }

    /**
     * Handles parsing and checking a [ClientScriptExpression] that is parsed from withing the [stringLiteral].
     *
     * This assigns the [StringLiteral.type] to [MetaType.Hook] and stores the [ClientScriptExpression]
     * as an attribute on [stringLiteral] for usage later.
     */
    private handleClientScriptExpression(stringLiteral: StringLiteral, typeHint: Type): void {
        // Base the source information on the string literal.
        const { name, line, column } = stringLiteral.source;

        // Invoke the parser to parse the text within the string.
        const errorListener = new ParserErrorListener(name, this.diagnostics, line - 1, column);
        const stream = CharStream.fromString(stringLiteral.value);
        stream.name = name;
        const clientScriptExpression = ScriptParser.invokeParser(stream, (parser: RuneScriptParser) => parser.clientScript(), errorListener, line - 1, column) as ClientScriptExpression | null;

        // Parser returns null if there was a parse error.
        if (!clientScriptExpression) {
            stringLiteral.type = MetaType.Error;
            return;
        }

        // Set typehint to the same as the argument.
        clientScriptExpression.typeHint = typeHint;
        this.visitNodeOrNull(clientScriptExpression);

        // Copy the type from the parsed expression.
        stringLiteral.subExpression = clientScriptExpression;
        stringLiteral.type = clientScriptExpression.type;
    }

    override visitJoinedStringExpression(joinedStringExpression: JoinedStringExpression): void {
        // Visit all parts.
        joinedStringExpression.parts.forEach(part => part.accept(this));

        // Set the resulting type.
        joinedStringExpression.type = PrimitiveType.STRING;
    }

    override visitJoinedStringPart(stringPart: StringPart): void {
        if (stringPart instanceof ExpressionStringPart) {
            // Type hint the inner expression.
            const expression = stringPart.expression;
            expression.typeHint = PrimitiveType.STRING;

            // Visit the inner expression.
            expression.accept(this);

            // Check that the type matches string.
            this.checkTypeMatch(expression, PrimitiveType.STRING, expression.type ?? MetaType.Error);
        }
    }

    override visitIdentifier(identifier: Identifier): void {
        const name = identifier.text;
        const hint = identifier.typeHint;

        // Attempt to call the dynamic command handler's type checker (if one exists).
        if (this.checkDynamicCommand(name, identifier)) {
            return;
        }

        // Error is reported inside 'resolveSymbol'.
        const symbol = this.resolveSymbol(identifier, name, hint ?? undefined);
        if (!symbol) return;

        if (symbol instanceof ScriptSymbol && symbol.trigger === this.commandTrigger && symbol.parameters !== MetaType.Unit) {
            identifier.reportError(this.diagnostics, DiagnosticMessage.GENERIC_TYPE_MISMATCH, '<unit>', symbol.parameters.representation);
        }

        identifier.reference = symbol;
    }

    private resolveSymbol(node: Expression, name: string, hint?: Type): RuneScriptSymbol | null {
        // Look through the current scopes table for a symbol with the given name and type.
        let symbol: RuneScriptSymbol | null = null;
        let type: Type | null = null;

        for (const temp of this.table.findAll<RuneScriptSymbol>(name)) {
            const tempType = this.symbolToType(temp);
            if (!tempType) continue;

            if (!hint && tempType instanceof MetaType.Script) {
                // If the hint is unknown it means we're somewhere that probably shouldn't
                // be referring to a script by only the name. This will not capture command
                // "scripts" since the symbolToType for commands returns the return value of
                // the command instead of being wrapped in MetaType.Script.
                continue;
            } else if (!hint || this.typeManager.check(hint, tempType)) {
                // Hint type matches (or is undefined), so we can stop looking.
                symbol = temp;
                type = tempType;
                break;
            } else if (!symbol) {
                // Default the symbol to the first thing found just in case
                // no exact matches exist.
                symbol = temp;
                type = tempType;
            }
        }

        // Unable to resolve the symbol.
        if (!symbol) {
            node.type = MetaType.Error;
            node.reportError(this.diagnostics, DiagnosticMessage.GENERIC_UNRESOLVED_SYMBOL, name);
            return null;
        }

        // Compiler error if the symbol type isn't defined here.
        if (!type) {
            node.type = MetaType.Error;
            node.reportError(this.diagnostics, DiagnosticMessage.UNSUPPORTED_SYMBOLTYPE_TO_TYPE, symbol.constructor.name);
            return null;
        }

        node.type = type;
        return symbol;
    }

    /**
     * Attempts to figure out the return type of [symbol].
     *
     * If the symbol is not valid for direct identifier lookup then `null` is returned.
     */
    private symbolToType(symbol: RuneScriptSymbol): Type | null {
        if (symbol instanceof ScriptSymbol) {
            if (symbol.trigger === CommandTrigger) {
                // Only commands can be referenced by an indentifier and return a value
                return symbol.returns;
            } else {
                // All other triggers get wrapped in a script type.
                return new MetaType.Script(symbol.trigger, symbol.parameters, symbol.returns);
            }
        } else if (symbol instanceof LocalVariableSymbol) {
            if (symbol.type instanceof ArrayType) {
                // Only local array variables are accessible by only their identifier.
                return symbol.type;
            } else {
                return null;
            }
        } else if (symbol instanceof BasicSymbol) {
            return symbol.type;
        } else if (symbol instanceof ConstantSymbol) {
            return null;
        }
        return null;
    }

    override visitToken(token: Token): void {
        // NO-OP
    }

    override visitNode(node: Node): void {
        const parent = node.parent;
        if (!parent) {
            node.reportInfo(this.diagnostics, `Unhandled node: ${node.constructor.name}.`);
        } else {
            node.reportInfo(this.diagnostics, `Unhandled node: ${node.constructor.name}. Parent: ${parent.constructor.name}.`);
        }
    }

    /**
     * Takes [expectedTypes] and iterates over [expressions] assigning each [Expression.typeHint]
     * a type from [expectedTypes]. All of the [expressions] types are then returned for comparison
     * at call site.
     *
     * This is only useful when the expected types are known ahead of time (e.g. assignments and calls).
     */
    private typeHintExpressionList(expectedTypes: Type[], expressions: Expression[]): Type[] {
        const actualTypes: Type[] = [];
        let typeCounter = 0;

        for (const expr of expressions) {
            // Set the type hint if we haven't exhausted the expected types.
            expr.typeHint = typeCounter < expectedTypes.length ? expectedTypes[typeCounter] : null;

            // Visit the expression (evaluates its type).
            expr.accept(this);

            // Add the evaluated type.
            actualTypes.push(this.getSafeType(expr));

            // Increment the counter for type hinting.
            if (expr.type instanceof TupleType) {
                typeCounter += expr.type.children.length;
            } else {
                typeCounter += 1;
            }
        }

        return actualTypes;
    }

    /**
     * Checks if the [expected] and [actual] match, including accepted casting.
     *
     * If the types passed in are a [TupleType] they will be compared using their flattened types.
     *
     * @see TypeManager.check
     */
    checkTypeMatch(node: Node, expected: Type, actual: Type, reportErrors = true): boolean {
        const expectedFlattened = expected instanceof TupleType ? expected.children : [expected];
        const actualFlattened = actual instanceof TupleType ? actual.children : [actual];

        let match = true;

        // If the expected type is an error, allow anything to prevent error propagation.
        if (expected === MetaType.Error) {
            match = true;
        } else if (expectedFlattened.length !== actualFlattened.length) {
            match = false;
        } else {
            for (let i = 0; i < expectedFlattened.length; i++) {
                match = match && this.typeManager.check(expectedFlattened[i], actualFlattened[i]);
            }
        }

        if (!match && reportErrors) {
            const actualRepresentation = actual === MetaType.Unit ? '<unit>' : actual.representation;
            node.reportError(this.diagnostics, DiagnosticMessage.GENERIC_TYPE_MISMATCH, actualRepresentation, expected.representation);
        }

        return match;
    }

    /**
     * Checks if the [actual] matches any of [expected], including accepted casting.
     *
     * If the types passed in are a [TupleType] they will be compared using their flattened types.
     *
     * @see TypeManager.check
     */
    private checkTypeMatchAny(node: Node, expected: Type[], actual: Type): boolean {
        for (const type of expected) {
            if (this.checkTypeMatch(node, type, actual, false)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Shortcut to [Node.accept] for nullable nodes.
     */
    public visitNodeOrNull(node: Node | null | undefined): void {
        if (!node) return;
        node.accept(this);
    }

    /**
     * Calls [Node.accept] on all nodes in a list.
     */
    private visitNodes(nodes: readonly Node[] | null | undefined): void {
        if (!nodes) return;
        for (const n of nodes) {
            this.visitNodeOrNull(n);
        }
    }

    /**
     * Returns the type of an expression, or MetaType.Error if missing/null.
     * Matches Kotlin's getTypeOrError().
     */
    private getSafeType(expr: Expression | null | undefined): Type {
        return expr && expr.type ? expr.type : MetaType.Error;
    }

    /**
     * Array of valid types allowed in logical conditional expressions.
     */
    private static readonly ALLOWED_LOGICAL_TYPES = [PrimitiveType.BOOLEAN];

    /**
     * Array of valid types allowed in relational conditional expressions.
     */
    private static readonly ALLOWED_RELATIONAL_TYPES = [PrimitiveType.INT, PrimitiveType.LONG];

    /**
     * Array of valid types allowed in arithmetic expressions.
     */
    private static readonly ALLOWED_ARITHMETIC_TYPES = [PrimitiveType.INT, PrimitiveType.LONG];

    /**
     * Set of types that have a literal representation.
     */
    private static readonly LITERAL_TYPES: ReadonlySet<Type> = new Set<Type>([PrimitiveType.INT, PrimitiveType.BOOLEAN, PrimitiveType.COORD, PrimitiveType.STRING, PrimitiveType.CHAR, PrimitiveType.LONG]);

    /**
     * A parser error listener that discards any syntax errors.
     */
    private static readonly DISCARD_ERROR_LISTENER: ANTLRErrorListener = {
        syntaxError<T>(recognizer: Recognizer<any> | undefined, offendingSymbol: any, line: number, charPositionInLine: number, msg: string, e: RecognitionException | undefined): void {
            // NO-OP
        },
        reportAmbiguity: function (recognizer: Parser, dfa: DFA, startIndex: number, stopIndex: number, exact: boolean, ambigAlts: BitSet | undefined, configs: ATNConfigSet): void {},
        reportAttemptingFullContext: function (recognizer: Parser, dfa: DFA, startIndex: number, stopIndex: number, conflictingAlts: BitSet | undefined, configs: ATNConfigSet): void {},
        reportContextSensitivity: function (recognizer: Parser, dfa: DFA, startIndex: number, stopIndex: number, prediction: number, configs: ATNConfigSet): void {}
    };
}
