import { AstVisitor } from '../../runescipt-parser/ast/AstVisitor';
import { ArithmeticExpression } from '../../runescipt-parser/ast/expr/ArithmeticExpression';
import { BinaryExpression } from '../../runescipt-parser/ast/expr/BinaryExpression';
import { CalcExpression } from '../../runescipt-parser/ast/expr/CalcExpression';
import { CommandCallExpression } from '../../runescipt-parser/ast/expr/call/CommandCallExpression';
import { JumpCallExpression } from '../../runescipt-parser/ast/expr/call/JumpCallExpression';
import { ProcCallExpression } from '../../runescipt-parser/ast/expr/call/ProcCallExpression';
import { ClientScriptExpression } from '../../runescipt-parser/ast/expr/ClientScriptExpression';
import { Expression } from '../../runescipt-parser/ast/expr/Expression';
import { Identifier } from '../../runescipt-parser/ast/expr/Identifier';
import { JoinedStringExpression } from '../../runescipt-parser/ast/expr/JoinedStringExpression';
import { BooleanLiteral } from '../../runescipt-parser/ast/expr/literal/BooleanLiteral';
import { CharacterLiteral } from '../../runescipt-parser/ast/expr/literal/CharacterLiteral';
import { CoordLiteral } from '../../runescipt-parser/ast/expr/literal/CoordLiteral';
import { IntegerLiteral } from '../../runescipt-parser/ast/expr/literal/IntegerLiteral';
import { Literal } from '../../runescipt-parser/ast/expr/literal/Literal';
import { NullLiteral } from '../../runescipt-parser/ast/expr/literal/NullLiteral';
import { StringLiteral } from '../../runescipt-parser/ast/expr/literal/StringLiteral';
import { ParenthesizedExpression } from '../../runescipt-parser/ast/expr/ParenthesizedExpression';
import { BasicStringPart, ExpressionStringPart, StringPart } from '../../runescipt-parser/ast/expr/StringPart';
import { ConstantVariableExpression } from '../../runescipt-parser/ast/expr/variable/ConstantVariableExpression';
import { GameVariableExpression } from '../../runescipt-parser/ast/expr/variable/GameVariableExpression';
import { LocalVariableExpression } from '../../runescipt-parser/ast/expr/variable/LocalVariableExpression';
import { Node } from '../../runescipt-parser/ast/Node';
import { NodeSourceLocation } from '../../runescipt-parser/ast/NodeSourceLocation';
import { Parameter } from '../../runescipt-parser/ast/Parameter';
import { ScriptFile } from '../../runescipt-parser/ast/ScriptFile';
import { Script } from '../../runescipt-parser/ast/Scripts';
import { ArrayDeclarationStatement } from '../../runescipt-parser/ast/statement/ArrayDeclarationStatement';
import { AssignmentStatement } from '../../runescipt-parser/ast/statement/AssignmentStatement';
import { BlockStatement } from '../../runescipt-parser/ast/statement/BlockStatement';
import { DeclarationStatement } from '../../runescipt-parser/ast/statement/DeclarationStatement ';
import { EmptyStatement } from '../../runescipt-parser/ast/statement/EmptyStatement';
import { ExpressionStatement } from '../../runescipt-parser/ast/statement/ExpressionStatement';
import { IfStatement } from '../../runescipt-parser/ast/statement/IfStatement';
import { ReturnStatement } from '../../runescipt-parser/ast/statement/ReturnStatement';
import { SwitchStatement } from '../../runescipt-parser/ast/statement/SwitchStatement';
import { WhileStatement } from '../../runescipt-parser/ast/statement/WhileStatement';
import { CodeGeneratorContext } from '../configuration/command/CodeGeneratorContext';
import { DynamicCommandHandler } from '../configuration/command/DynamicCommandHandler';
import { DiagnosticMessage } from '../diagnostics/DiagnosticMessage';
import { Diagnostics } from '../diagnostics/Diagnostics';
import { getCallReference, getConstantSubExpression, getDeclarationSymbol, getIdentifierReference, getParameterSymbol, getScriptReturnType, getScriptSubjectReference, getScriptSymbol, getScriptTriggerType, getStringReference, getStringSubExpression, getSwitchDefaultCase } from '../NodeAttributes';
import { ScriptSymbol, ServerScriptSymbol } from '../symbol/ScriptSymbol';
import { BasicSymbol, LocalVariableSymbol } from '../symbol/Symbol';
import { SymbolTable } from '../symbol/SymbolTable';
import { CommandTrigger } from '../trigger/CommandTrigger';
import { BaseVarType } from '../type/BaseVarType';
import { MetaType } from '../type/MetaType';
import { PrimitiveType } from '../type/PrimitiveType';
import { TupleType } from '../type/TupleType';
import { Instruction } from './Instruction';
import { Opcode } from './Opcode';
import { Block } from './script/Block';
import { Label } from './script/Label';
import { LabelGenerator } from './script/LabelGenerator';
import { RuneScript } from './script/RuneScript';
import { SwitchCase } from './script/SwitchTable';
import { reportError } from '../diagnostics/DiagnosticHelpers'

export class CodeGenerator extends AstVisitor<void> {
    /**
     * An instance of a [LabelGenerator] used to created labels within the instance.
     */
    private labelGenerator = new LabelGenerator();

    /**
     * A list of scripts that were defined in the file.
     */
    private _scripts: RuneScript[] = [];

    /**
     * The current active block.
     */
    private block!: Block;

    /**
     * Used for source line number instructions to prevent repeating the same line number
     * for multiple expressions.
     */
    private lastLineNumber: number = -1;

    constructor(
        private rootTable: SymbolTable,
        private dynamicCommands: Map<string, DynamicCommandHandler>,
        private diagnostics: Diagnostics
    ) {
        super();
    }

    /**
     * An immutable list of scripts that were defined in the file.
     */
    public get scripts(): RuneScript[] {
        return this._scripts;
    }

    /**
     * The current active script.
     */
    private get script(): RuneScript {
        return this._scripts[this._scripts.length - 1];
    }

    /**
     * Binds [block] by setting it as the active block and adding it to the active [script].
     */
    private bind(block: Block): Block {
        this.block = block;
        return block;
    }

    /**
     * Creates a new [Block] with the given name.
     */
    private generateBlock(name: string, generateUniqueName = true): Block {
        const label = generateUniqueName
            ? this.labelGenerator.generate(name)
            : new Label(name);
        const block = new Block(label);
        this.script.blocks.push(block);
        return block;
    }

    /**
     * Creates a new [Block] from the given [Label].
     */
    private generateBlockLabel(label: Label): Block {
        const block = new Block(label);
        this.script.blocks.push(block);
        return block;
    }

    /**
     * Adds an instruction to [block], which defaults to the most recently bound [Block].
     */
    public instruction<T>(opcode: Opcode<T>, operand: T, source?: NodeSourceLocation, block: Block = this.block): void {
        block.instructions.push(new Instruction(opcode, operand, source));
    }

    /**
     * Adds an instruction to [block], which defaults to the most recently bound [Block].
     */
    protected instructionUnit(opcode: Opcode<void>, source?: NodeSourceLocation, block: Block = this.block): void {
        block.instructions.push(new Instruction(opcode, undefined, source));
    }

    /**
     * Inserts a [Opcode.LineNumber] instruction if the source line of the node
     * does not match the previous source line number instruction that was
     * inserted.
     */
    public lineInstruction(node: Node) {
        if (node.source.line !== this.lastLineNumber) {
            this.lastLineNumber = node.source.line;
        }
    }

    override visitScriptFile(scriptFile: ScriptFile): void {
        this.visitNodes(scriptFile.scripts);
    }

    override visitScript(script: Script): void {
        // Skip commands declarations
        if (getScriptTriggerType(script) == CommandTrigger) {
            return;
        }

        // Add the script to the list of scripts in the file.
        this._scripts.push(new RuneScript(script.source.name, getScriptSymbol(script), getScriptSubjectReference(script)));

        // Visit parameters to add them to the scripts local table.
        this.visitNodes(script.parameters);

        // Generate and bind an entry point block
        this.bind(this.generateBlock("entry", false));

        // Insert source line number
        this.lineInstruction(script);

        // Visit the statements
        this.visitNodes(script.statements);

        // Add the default returns.
        this.generateDefaultReturns(script);

        // Reset the internal state
        this.labelGenerator.reset();
        this.lastLineNumber = -1;
    }

    override visitParameter(parameter: Parameter): void {
        const symbol = getParameterSymbol(parameter);

        // Add the local variable symbol to list of parameters and all locals.
        this.script.locals.parameters.push(symbol);
        this.script.locals.all.push(symbol);
    }

    /**
     * Generates the default returns that is added to the end of every script.
     */
    private generateDefaultReturns(script: Script) {
        // Specify the line number where the script is defined for default returns.
        this.lineInstruction(script);

        const types = TupleType.toList(getScriptReturnType(script));
        for (const type of types) {
            if (type == PrimitiveType.INT) {
                this.instruction(Opcode.PushConstantInt, 0);
            } else if (type.baseType == BaseVarType.INTEGER) {
                this.instruction(Opcode.PushConstantInt, -1);
            } else if (type.baseType == BaseVarType.STRING) {
                this.instruction(Opcode.PushConstantString, "");
            } else if (type.baseType == BaseVarType.LONG) {
                this.instruction(Opcode.PushConstantLong, BigInt(-1));
            } else {
                throw new Error(`Unsupported type in returns: ${type}`);
            }
        }
        this.instructionUnit(Opcode.Return);
    }

    override visitBlockStatement(blockStatement: BlockStatement): void {
        this.visitNodes(blockStatement.statements);
    }

    override visitReturnStatement(returnStatement: ReturnStatement): void {
        this.visitNodes(returnStatement.expressions);
        this.lineInstruction(returnStatement);
        this.instructionUnit(Opcode.Return, returnStatement.source);
    }

    override visitIfStatement(ifStatement: IfStatement): void {
        const ifTrue = this.labelGenerator.generate("if_true");
        const ifElse = ifStatement.elseStatement ? this.labelGenerator.generate("if_else") : null;
        const ifEnd = this.labelGenerator.generate("if_end");

        // Generate condition
        this.generateCondition(ifStatement.condition, this.block, ifTrue, ifElse ?? ifEnd);

        // Bind the 'if_true' block and visit the statements within.
        this.bind(this.generateBlockLabel(ifTrue));
        this.visitNodeOrNull(ifStatement.thenStatement);
        this.instruction(Opcode.Branch, ifEnd);

        // Handle else statement if it exists.
        if (ifElse != null) {
            // Bind the 'if_else' block and visit the statements within.
            this.bind(this.generateBlockLabel(ifElse));
            this.visitNodeOrNull(ifStatement.elseStatement);

            // Branch to the 'if_end' label.
            this.instruction(Opcode.Branch, ifEnd);
        }

        // Bind the 'if_end' block.
        this.bind(this.generateBlockLabel(ifEnd));
    }

    override visitWhileStatement(whileStatement: WhileStatement): void {
        const whileStart = this.labelGenerator.generate("while_start");
        const whileBody = this.labelGenerator.generate("while_body");
        const whileEnd = this.labelGenerator.generate("while_end");

        // Bind the start block and generate the condition in it.
        const startBlock = this.bind(this.generateBlockLabel(whileStart));
        this.generateCondition(whileStatement.condition, startBlock, whileBody, whileEnd);

        // Generate the body and branch back up to the condition.
        this.bind(this.generateBlockLabel(whileBody));
        this.visitNodeOrNull(whileStatement.thenStatement);
        this.instruction(Opcode.Branch, whileStart);

        // Generate the end block that is jumped to when the condition is false.
        this.bind(this.generateBlockLabel(whileEnd));
    }

    private generateCondition(condition: Expression, block: Block, branchTrue: Label, branchFalse: Label) {
        if (condition instanceof BinaryExpression) {
            const isLogical = condition.operator.text in CodeGenerator.LOGICAL_OPERATORS;
            if (!isLogical) {
                // Assume if we get to this point that the left and right types match and are valid.
                const baseType = condition.left.type.baseType;
                if (baseType == null) {
                    reportError(this.diagnostics, condition.left, DiagnosticMessage.TYPE_HAS_NO_BASETYPE, condition.left.type);
                    return;
                }

                // Lookup the proper branching instrunction based on the base type used.
                const branchOpcodes = CodeGenerator.BRANCH_MAPPINGS[baseType] ?? new Error(`No mappings for BaseType: ${baseType}`);
                const branchOpcode = branchOpcodes[condition.operator.text] ?? new Error(`No mappings for operator: ${condition.operator.text}`);

                // Visit the two sides
                this.visitNodeOrNull(condition.left);
                this.visitNodeOrNull(condition.right);

                // Add the true branch opcode and false branch instructions.
                this.instruction(branchOpcode, branchTrue, undefined, block);
                this.instruction(Opcode.Branch, branchFalse, undefined, block);
            } else {
                // Generate the label for the next block.
                const nextBlockLabel = 
                    condition.operator.text === CodeGenerator.LOGICAL_OR
                        ? this.labelGenerator.generate("condition_or")
                        : this.labelGenerator.generate("condition_and");

                // Figure out which labels should be true and false labels.
                const trueLabel = condition.operator.text === CodeGenerator.LOGICAL_OR ? branchTrue : nextBlockLabel;
                const falseLabel = condition.operator.text === CodeGenerator.LOGICAL_OR ? nextBlockLabel : branchFalse;

                this.generateCondition(condition.left, block, trueLabel, falseLabel);
                const nextBlock = this.bind(this.generateBlockLabel(nextBlockLabel));
                this.generateCondition(condition.right, nextBlock, branchTrue, branchFalse);
            }
        } else if (condition instanceof ParenthesizedExpression) {
            this.generateCondition(condition.expression, block, branchTrue, branchFalse);
        } else {
            reportError(this.diagnostics, condition, DiagnosticMessage.INVALID_CONDITION, condition.constructor.name);
        }
    }

    override visitSwitchStatement(switchStatement: SwitchStatement): void {
        const table = this.script.generateSwitchTable();
        const hasDefault = getSwitchDefaultCase(switchStatement) != null;
        const switchDefault = hasDefault
            ? this.labelGenerator.generate("switch_default_case")
            : null;
        const switchEnd = this.labelGenerator.generate("switch_end");

        // Visit the main expression that contains the value.
        this.visitNodeOrNull(switchStatement.condition);

        // Add the switch instruction with a reference to the table.
        this.instruction(Opcode.Switch, table, switchStatement.source);

        const firstCase = switchStatement.cases[0] ?? null;
        if (firstCase == null || !firstCase.isDefault) {
            // Jump to either the default or end depending on if a default is defined.
            this.instruction(Opcode.Branch, switchDefault ?? switchEnd);
        }

        for (const caseEntry of switchStatement.cases) {
            // Generate a label if the case isn't a default case.
            const caseLabel = !caseEntry.isDefault
                ? this.labelGenerator.generate(`switch_${table.id}_case`)
                : (switchDefault ?? (() => { throw new Error("switchDefault null while having a default case"); }));
            
            // Loop over the case keys and resolve them to constants.
            const keys: any[] = [];

            for (const keyExpression of caseEntry.keys) {
                const constantKey = this.resolveConstantValue(keyExpression);

                if (constantKey == null) {
                    // 'null' is only returned if the constant wasn't defined or the expression wasn't supported.
                    reportError(this.diagnostics, keyExpression, DiagnosticMessage.NULL_CONSTANT, keyExpression.constructor.name);
                    continue;
                }

                // Add the key to the temporary list of keys.
                keys.push(constantKey);
            }

            // Add the case to the table.
            table.addCase(new SwitchCase(caseLabel, keys));

            // Generate the block for the case and then add the code within it.
            this.bind(this.generateBlockLabel(caseLabel));
            this.visitNodes(caseEntry.statements);
            this.instruction(Opcode.Branch, switchEnd);
        }

        // Bind the switch end block that all cases jump to (no fallthrough).
        this.bind(this.generateBlockLabel(switchEnd));
    }

    /**
     * Attempts to resolve [expression] to a constant value.
     */
    private resolveConstantValue(expression: Expression): any |null {
        if (expression instanceof ConstantVariableExpression) {
            return getConstantSubExpression(expression)
                ? this.resolveConstantValue(getConstantSubExpression(expression))
                : null;
        }

        if (expression instanceof Identifier) {
            return expression.reference;
        }

        if (expression instanceof StringLiteral) {
            return expression.reference ?? expression.value;
        }

        if (expression instanceof Literal) {
            return expression.value;
        }

        return null;
    }

    override visitDeclarationStatement(declarationStatement: DeclarationStatement): void {
        const symbol = getDeclarationSymbol(declarationStatement);

        // Add the variable to the scripts local table.
        this.script.locals.all.push(symbol);

        const initializer = declarationStatement.initializer;
        if (initializer != null) {
            // Visit the initializer expression
            this.visitNodeOrNull(declarationStatement.initializer);
        } else {
            // Handle default based on the type information.
            const def = symbol.type.defaultValue;

            if (typeof def === "number") {
                this.instruction(Opcode.PushConstantInt, def);
            } else if (typeof def === "string") {
                this.instruction(Opcode.PushConstantString, def);
            } else if (typeof def === "bigint") {
                this.instruction(Opcode.PushConstantLong, def);
            } else {
                throw new Error(
                    `Unsupported default type: ${def?.constructor?.name}`
                );
            }
        }
        this.instruction(Opcode.PopLocalVar, symbol, declarationStatement.source);
    }

    override visitArrayDeclarationStatement(arrayDeclarationStatement: ArrayDeclarationStatement): void {
        const symbol = getDeclarationSymbol(arrayDeclarationStatement);

        // Add the variable to the scripts local table.
        this.script.locals.all.push(symbol);

        // Visit the initializer and add the `define_array` instruction.
        this.visitNodeOrNull(arrayDeclarationStatement.initializer);
        this.instruction(Opcode.DefineArray, symbol, arrayDeclarationStatement.source);
    }

    override visitAssignmentStatement(assignmentStatement: AssignmentStatement): void {
        const vars = assignmentStatement.vars;

        /**
         * Special case for arrays since they need to push the index first when popping a new value.
         * Arrays are disallowed in multi-assignment statements in earlier steps.
         */
        const first = vars[0];
        if (first instanceof LocalVariableExpression && first.index != null) {
            this.visitNodeOrNull(first.index);
        }

        // Visist the expressions from the left side.
        this.visitNodes(assignmentStatement.expressions);

        // Loop through the variables in reverse
        for (let i = vars.length - 1; i >= 0; i--) {
            const variable = vars[i];
            const reference = variable.reference;

            if (reference == null) {
                reportError(this.diagnostics, variable, DiagnosticMessage.SYMBOL_IS_NULL);
                return;
            }

            if (reference instanceof LocalVariableSymbol) {
                this.instruction(Opcode.PopLocalVar, reference, variable.source);
            } else if (reference instanceof BasicSymbol) {
                if (!(variable instanceof GameVariableExpression)) {
                    throw new Error("Expected 'GameVariableExpression'.");
                }

                this.instruction(
                    !variable.dot ? Opcode.PopVar : Opcode.PopVar2,
                    reference,
                    variable.source
                );
            } else {
                throw new Error(`Unsupported reference type: ${reference}`);
            }
        }
    }

    override visitExpressionStatement(expressionStatement: ExpressionStatement): void {
        const expression = expressionStatement.expression;

        // Visit expression
        this.visitNodeOrNull(expression);

        // Discard anything that the expression returns.
        const types = TupleType.toList(expression.type);
        for (const type of types) {
            const baseType = type.baseType;
            if (baseType == null) {
                reportError(this.diagnostics, expressionStatement, DiagnosticMessage.TYPE_HAS_NO_BASETYPE, type);
                return;
            }
            this.instruction(Opcode.Discard, baseType);
        }
    }

    override visitEmptyStatement(emptyStatement: EmptyStatement): void {
        // NO-OP
    }

    override visitLocalVariableExpression(localVariableExpression: LocalVariableExpression): void {
        const reference = localVariableExpression.reference as LocalVariableSymbol | null;
        if (reference == null) {
            reportError(this.diagnostics, localVariableExpression, DiagnosticMessage.SYMBOL_IS_NULL);
            return;
        }
        this.lineInstruction(localVariableExpression);
        this.visitNodeOrNull(localVariableExpression.index);
        this.instruction(Opcode.PushLocalVar, reference, localVariableExpression.source);
    }

    override visitGameVariableExpression(gameVariableExpression: GameVariableExpression): void {
        const reference = gameVariableExpression.reference as BasicSymbol | null;
        if (reference == null) {
            reportError(this.diagnostics, gameVariableExpression, DiagnosticMessage.SYMBOL_IS_NULL);
            return;
        }

        this.lineInstruction(gameVariableExpression);
        this.instruction(
            !gameVariableExpression.dot ? Opcode.PushVar : Opcode.PushVar2,
            reference,
            gameVariableExpression.source
        );
    }

    override visitConstantVariableExpression(constantVariableExpression: ConstantVariableExpression): void {
        const subExpression = getConstantSubExpression(constantVariableExpression);
        if (subExpression == null) {
            reportError(this.diagnostics, constantVariableExpression, DiagnosticMessage.EXPRESSION_NO_SUBEXPR);
            return;
        }
        this.visitNodeOrNull(subExpression);
    }

    override visitParenthesizedExpression(parenthesizedExpression: ParenthesizedExpression): void {
        this.lineInstruction(parenthesizedExpression);

        // Visit the inner expression
        this.visitNodeOrNull(parenthesizedExpression.expression);
    }

    override visitArithmeticExpression(arithmeticExpression: ArithmeticExpression): void {
        const operator = arithmeticExpression.operator.text;
        const type = arithmeticExpression.left.type.baseType;

        const opcodes = (() => {
            switch (type) {
                case BaseVarType.INTEGER:
                    return CodeGenerator.INT_OPERATIONS;
                case BaseVarType.LONG:
                    return CodeGenerator.LONG_OPERATIONS;
                default:
                    throw new Error(`No mapping for BaseType: ${type}.`);
            }
        })();

        const opcode = opcodes[operator];
        if (!opcode) throw new Error(`No mapping for operator: ${operator}.`);

        // Visit left side
        this.visitNodeOrNull(arithmeticExpression.left);

        // Visit right side
        this.visitNodeOrNull(arithmeticExpression.right);

        // Add the instruction with the opcode based on the operator.
        this.instructionUnit(opcode);
    }

    override visitCalcExpression(calcExpression: CalcExpression): void {
        this.lineInstruction(calcExpression);
        this.visitNodeOrNull(calcExpression);
    }

    override visitCommandCallExpression(commandCallExpression: CommandCallExpression): void {
        const symbol = getCallReference(commandCallExpression) as ScriptSymbol | null;
        if (symbol == null) {
            reportError(this.diagnostics, commandCallExpression, DiagnosticMessage.SYMBOL_IS_NULL);
            return;
        }

        // Attempt to call the dynamic command handlers code generation (if one exists).
        if (this.emitDynamicCommand(commandCallExpression.nameString, commandCallExpression)) {
            return;
        }

        this.visitNodes(commandCallExpression.arguments);
        this.lineInstruction(commandCallExpression);
        this.instruction(Opcode.Command, symbol, commandCallExpression.source);
    }

    private emitDynamicCommand(name: string, expression: Expression): boolean {
        const dynamicCommand = this.dynamicCommands[name];
        if (!dynamicCommand) return false;

        const context = new CodeGeneratorContext(this, this.rootTable, expression, this.diagnostics);
        dynamicCommand.generateCode.call(context);

        return true;
    }

    override visitProcCallExpression(procCallExpression: ProcCallExpression): void {
        const symbol = getCallReference(procCallExpression) as ScriptSymbol | null;
        if (symbol == null) {
            reportError(this.diagnostics, procCallExpression, DiagnosticMessage.SYMBOL_IS_NULL);
            return;
        }

        this.visitNodes(procCallExpression.arguments);
        this.lineInstruction(procCallExpression);
        this.instruction(Opcode.Gosub, symbol, procCallExpression.source);
    }

    override visitJumpCallExpression(jumpCallExpression: JumpCallExpression): void {
        const symbol = getCallReference(jumpCallExpression) as ScriptSymbol | null;
        if (symbol == null) {
            reportError(this.diagnostics, jumpCallExpression, DiagnosticMessage.SYMBOL_IS_NULL);
            return;
        }

        this.visitNodes(jumpCallExpression.arguments);
        this.lineInstruction(jumpCallExpression);
        this.instruction(Opcode.Jump, symbol, jumpCallExpression.source);
    }

    override visitClientScriptExpression(clientScriptExpression: ClientScriptExpression): void {
        const symbol = getCallReference(clientScriptExpression) as ServerScriptSymbol | null;
        if (symbol == null) {
            reportError(this.diagnostics, clientScriptExpression, DiagnosticMessage.SYMBOL_IS_NULL);
            return;
        }

        // Convert the parameter type to a list and generate a string with all the type char codes combined.
        const argumentTypes = TupleType.toList(symbol.parameters);
        let argumentTypesShort = argumentTypes.map(t => t.code).filter(Boolean).join("");

        // Safety check in case there was a type with no char code defined.
        if (argumentTypes.length !== argumentTypesShort.length) {
            throw new Error("Mismatch between argument types and their codes.");
        }

        // Write the script reference and arguments.
        this.instruction(Opcode.PushConstantSymbol, symbol, clientScriptExpression.source);
        this.visitNodes(clientScriptExpression.arguments);

        // Optionally handle the transmit list if it exists.
        if (clientScriptExpression.transmitList.length > 0) {
            this.visitNodes(clientScriptExpression.transmitList);

            // Write the 'type' char that signifies to read the transmit list.
            argumentTypesShort += "Y";

            // Write the number of things in the transmit list.
            this.instruction(Opcode.PushConstantInt, clientScriptExpression.transmitList.length);
        }

        // Write the argument types.
        this.instruction(Opcode.PushConstantString, argumentTypesShort);
    }

    override visitIntegerLiteral(integerLiteral: IntegerLiteral): void {
        this.lineInstruction(integerLiteral);
        this.instruction(Opcode.PushConstantInt, integerLiteral.value, integerLiteral.source);
    }

    override visitCoordLiteral(coordLiteral: CoordLiteral): void {
        this.lineInstruction(coordLiteral);
        this.instruction(Opcode.PushConstantInt, coordLiteral.value, coordLiteral.source);
    }

    override visitBooleanLiteral(booleanLiteral: BooleanLiteral): void {
        this.lineInstruction(booleanLiteral);
        this.instruction(Opcode.PushConstantInt, booleanLiteral.value ? 1 : 0, booleanLiteral.source);
    }

    override visitCharacterLiteral(characterLiteral: CharacterLiteral): void {
        this.lineInstruction(characterLiteral);
        this.instruction(Opcode.PushConstantInt, characterLiteral.value.charCodeAt(0), characterLiteral.source);
    }

    override visitNullLiteral(nullLiteral: NullLiteral): void {
        this.lineInstruction(nullLiteral);

        const baseType = nullLiteral.type.baseType;
        if (baseType == BaseVarType.STRING) {
            this.instruction(Opcode.PushConstantString, "null");
            return
        } else if (baseType == BaseVarType.LONG) {
            this.instruction(Opcode.PushConstantLong, BigInt(-1));
            return;
        }

        this.instruction(Opcode.PushConstantInt, 1, nullLiteral.source);

        if (nullLiteral.type instanceof MetaType.Hook) {
            /**
             * TODO: Figure out better way to handle this.
             * Hack to make null clientscript references work properly.
             */
            this.instruction(Opcode.PushConstantString, "");
        }
    }

    override visitStringLiteral(stringLiteral: StringLiteral): void {
        this.lineInstruction(stringLiteral);

        // Visit the sub-expression if one exists.
        const subExpression = getStringSubExpression(stringLiteral);
        if (subExpression != null) {
            this.visitNodeOrNull(subExpression);
            return;
        }

        // Push the reference if one exists.
        const reference = getStringReference(stringLiteral);
        if (reference != null) {
            this.instruction(Opcode.PushConstantSymbol, reference, stringLiteral.source);
            return;
        }

        this.instruction(Opcode.PushConstantString, stringLiteral.value, stringLiteral.source);
    }

    override visitJoinedStringExpression(joinedStringExpression: JoinedStringExpression): void {
        this.visitNodes(joinedStringExpression.parts);

        if (joinedStringExpression.parts.length > 1) {
            this.lineInstruction(joinedStringExpression);
            this.instruction(Opcode.JoinString, joinedStringExpression.parts.length, joinedStringExpression.source);
        }
    }

    override visitJoinedStringPart(stringPart: StringPart): void {
        this.lineInstruction(stringPart);

        if (stringPart instanceof BasicStringPart) {
            this.instruction(Opcode.PushConstantString, stringPart.value, stringPart.source);
        } else if (stringPart instanceof ExpressionStringPart) {
            this.visitNodeOrNull(stringPart.expression);
        } else {
            throw new Error(`Unsupported StringPart: ${stringPart.constructor.name}`);
        }
    }

    override visitIdentifier(identifier: Identifier): void {
        const reference = getIdentifierReference(identifier);
        if (reference == null) {
            reportError(this.diagnostics, identifier, DiagnosticMessage.SYMBOL_IS_NULL);
            return;
        }

        this.lineInstruction(identifier);

        // Add the instruction based on reference type.
        if (reference instanceof ServerScriptSymbol && reference.trigger == CommandTrigger) {
            // Attempt to call the dynamic command handlers code generation (if one exists).
            if (this.emitDynamicCommand(identifier.text, identifier)) {
                return;
            }

            // Commands can be referenced by just their name if they have no arguments.
            this.instruction(Opcode.Command, reference, identifier.source);
        } else {
            // Default to just pushing the symbol as a constant.
            this.instruction(Opcode.PushConstantSymbol, reference, identifier.source);
        }
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
    public visitNodes(nodes: readonly Node[] | null | undefined): void {
        if (!nodes) return;
        for (const n of nodes) {
            this.visitNodeOrNull(n);
        }
    }

    /**
     * The operator for logical and.
     */
    private static readonly LOGICAL_AND = "&";

    /**
     * The operator for logical or.
     */
    private static readonly LOGICAL_OR = "|";

    /**
     * Array of possible logical operators.
     */
    private static readonly LOGICAL_OPERATORS = [
        CodeGenerator.LOGICAL_AND,
        CodeGenerator.LOGICAL_OR
    ] as const;

    /**
     * Mapping of operators to their branch opcode for int based types.
     */
    private static readonly INT_BRANCHES = new Map<string, Opcode<any>>([
        ["=", Opcode.BranchEquals],
        ["!", Opcode.BranchNot],
        ["<", Opcode.BranchLessThan],
        [">", Opcode.BranchGreaterThan],
        ["<=", Opcode.BranchLessThanOrEquals],
        [">=", Opcode.BranchGreaterThanOrEquals],
    ]);

    /**
     * Mapping of operators to their branch opcode for object based types.
     */
    private static readonly OBJ_BRANCHES = new Map<string, Opcode<any>>([
        ["=", Opcode.ObjBranchEquals],
        ["!", Opcode.ObjBranchNot],
    ]);

    /**
     * Mapping of operators to their branch opcode for long based types.
     */
    private static readonly LONG_BRANCHES = new Map<string, Opcode<any>>([
        ["=", Opcode.LongBranchEquals],
        ["!", Opcode.LongBranchNot],
        ["<", Opcode.LongBranchLessThan],
        [">", Opcode.LongBranchGreaterThan],
        ["<=", Opcode.LongBranchLessThanOrEquals],
        [">=", Opcode.LongBranchGreaterThanOrEquals],
    ]);

    /**
     * A map for getting the branch instructions based on a base type.
     */
    private static readonly BRANCH_MAPPINGS = new Map<BaseVarType, Map<string, Opcode<any>>>([
        [BaseVarType.INTEGER, CodeGenerator.INT_BRANCHES],
        [BaseVarType.STRING, CodeGenerator.OBJ_BRANCHES],
        [BaseVarType.LONG, CodeGenerator.LONG_BRANCHES],
    ]);

    /**
     * Mapping of operators to their math opcode for int based types.
     */
    private static readonly INT_OPERATIONS = new Map<string, Opcode<any>>([
        ["+", Opcode.Add],
        ["-", Opcode.Sub],
        ["*", Opcode.Multiply],
        ["/", Opcode.Divide],
        ["%", Opcode.Modulo],
        ["&", Opcode.And],
        ["|", Opcode.Or],
    ]);

    /**
     * Mapping of operators to their math opcode for long based types.
     */
    private static readonly LONG_OPERATIONS = new Map<string, Opcode<any>>([
        ["+", Opcode.LongAdd],
        ["-", Opcode.LongSub],
        ["*", Opcode.LongMultiply],
        ["/", Opcode.LongDivide],
        ["%", Opcode.LongModulo],
        ["&", Opcode.LongAnd],
        ["|", Opcode.LongOr],
    ]);
}