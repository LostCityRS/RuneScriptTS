import { AstVisitor } from '../../runescipt-parser/ast/AstVisitor';
import { Node } from '../../runescipt-parser/ast/Node';
import { Parameter } from '../../runescipt-parser/ast/Parameter';
import { ScriptFile } from '../../runescipt-parser/ast/ScriptFile';
import { Script } from '../../runescipt-parser/ast/Scripts';
import { BlockStatement } from '../../runescipt-parser/ast/statement/BlockStatement';
import { SwitchCase } from '../../runescipt-parser/ast/statement/SwitchCase';
import { SwitchStatement } from '../../runescipt-parser/ast/statement/SwitchStatement';
import { Diagnostic } from '../diagnostics/Diagnostic';
import { DiagnosticMessage } from '../diagnostics/DiagnosticMessage';
import { Diagnostics } from '../diagnostics/Diagnostics';
import { DiagnosticType } from '../diagnostics/DiagnosticType';
import { getParameterSymbol, getScriptParameterType, getScriptReturnType, setBlockScope, setParameterSymbol, setScriptParameterType, setScriptReturnType, setScriptScope, setScriptSubjectReference, setScriptSymbol, setScriptTriggerType, setSwitchCaseScope, setSwitchType } from '../NodeAttributes';
import { ScriptSymbol, ServerScriptSymbol } from '../symbol/ScriptSymbol';
import { BasicSymbol, LocalVariableSymbol } from '../symbol/Symbol';
import { SymbolTable } from '../symbol/SymbolTable';
import { SymbolType } from '../symbol/SymbolType';
import { CommandTrigger } from '../trigger/CommandTrigger';
import { SubjectMode } from '../trigger/SubjectMode';
import { TriggerManager } from '../trigger/TriggerManager';
import { TriggerType } from '../trigger/TriggerType';
import { MetaType } from '../type/MetaType';
import { PrimitiveType } from '../type/PrimitiveType';
import { TupleType } from '../type/TupleType';
import { Type } from '../type/Type';
import { TypeManager } from '../type/TypeManager';

/**
 * An [AstVisitor] implementation that handles the following.
 *
 * - Script declarations
 * - Switch statement type declaration, which is used later on in [TypeChecking]
 * - Local variable declarations
 * - Constant references
 */
export class PreTypeChecking extends AstVisitor<void> {
    /**
     * A stack of symbol tables to use through the script file.
     */
    private readonly tables: SymbolTable[] = [];

    /**
     * The current active symbol table.
     */
    private get table(): SymbolTable {
        return this.tables[0];
    }

    /**
     * A cached reference to a [Type] representing a `category`.
     */
    private readonly categoryType: Type | null;

    constructor(
        private readonly typeManager: TypeManager,
        private readonly triggerManager: TriggerManager,
        private readonly rootTable: SymbolTable,
        private readonly diagnostics: Diagnostics
    ) {
        super();
        this.categoryType = this.typeManager.findOrNull("category");

        // Add a base table for the file
        this.tables.unshift(this.rootTable.createSubTable());
    }

    private isTypeMode(mode: SubjectMode): mode is { type: Type; category: boolean; global: boolean } {
       return 'type' in mode;
    }

    /**
     * Wraps [block] with creating a new [SymbolTable], pushing it to [tables]
     * and then popping it back out after the block is run.
     */
    private createScopedTable(block: () => void): void {
        this.tables.unshift(this.table.createSubTable());
        try {
            block();
        } finally {
            this.tables.shift();
        }
    }

    override visitScriptFile(scriptFile: ScriptFile): void {
        for (const script of scriptFile.scripts) {
            this.createScopedTable(() => {
                script.accept(this);
            })
        }
    }

    override visitScript(script: Script): void {
        const trigger = this.triggerManager.findOrNull(script.trigger.text);

        if (!trigger) {
            this.reportError(script.trigger, DiagnosticMessage.SCRIPT_TRIGGER_INVALID, script.trigger.text);
        } else {
            setScriptTriggerType(script, trigger);
        }

        if (script.isStar && trigger !== CommandTrigger) {
            /**
             * Only commands should allow the '*' symbol after a name.
             * The only reason the '*' symbol is allowed is to allow defining cases like
             * "npc_queue" and "npc_queue*" as two different commands since they have different semantics.
             */
            this.reportError(script.name, DiagnosticMessage.SCRIPT_COMMAND_ONLY);
        }

        // Verify subject matched what the triggers requires.
        this.checkScriptSubject(trigger, script);

        // Visit the parameters.
        const parameters = script.parameters;
        parameters?.forEach(param => param.accept(this));

        // Specify the parameter types for easy lookup later.
        setScriptParameterType(script, TupleType.fromList(parameters?.map(p => getParameterSymbol(p).type) ?? []));

        // Verify parameters match what the trigger type allows.
        this.checkScriptParameters(trigger, script, parameters);

        // Convert return type tokens into actual Types and attach to the script node.
        const returnTokens = script.returnTokens;
        if (returnTokens && returnTokens.length > 0) {
            const returns: Type[] = [];
            for (const token of returnTokens) {
                const type = this.typeManager.findOrNull(token.text);
                if (!type) {
                    this.reportError(token, DiagnosticMessage.GENERIC_INVALID_TYPE, token.text);
                }
                returns.push(type ?? MetaType.Error);
            }
            setScriptReturnType(script, TupleType.fromList(returns));
        } else {
            // Default return based on trigger
            setScriptReturnType(script, !trigger
                ? MetaType.Error
                : trigger.allowReturns
                ? MetaType.Unit
                : MetaType.Nothing
            )
        }

        // Verify returns match what the trigger type allows
        this.checkScriptReturns(trigger, script);

        if (trigger) {
            // Attempt to insert the script into the root table and error if failed.
            const scriptSymbol = new ServerScriptSymbol(trigger, script.nameString, getScriptParameterType(script), getScriptReturnType(script));

            const inserted = this.rootTable.insert(SymbolType.serverScript(trigger), scriptSymbol);
            if (!inserted) {
                this.reportError(script, DiagnosticMessage.SCRIPT_REDECLARATION, trigger.identifier, script.nameString);
            } else {
                // Only set the symbol if it was actually inserted
                setScriptSymbol(script, scriptSymbol);
            }
        }

        // Visit the code
        script.statements.forEach(stmt => stmt.accept(this));

        // Set the root symbol table for the script
        setScriptScope(script, this.table);
    }

    /**
     * Validates the subject of [script] is allowed following [SubjectMode] for the
     * [trigger].
     */
    private checkScriptSubject(trigger: TriggerType | null | undefined, script: Script): void {
        const mode = trigger?.subjectMode;
        if (!mode) return;

        const subject = script.name.text;

        // Name mode allows anything as the subject
        if (mode === SubjectMode.Name) {
            return;
        }

        // Check for global subject
        if (subject === "_") {
            this.checkGlobalScriptSubject(trigger, script);
            return;
        }

        // Check for category reference subject
        if (subject.startsWith("_")) {
            this.checkCategoryScriptSubject(trigger, script, subject.substring(1));
            return;
        }

        // Check for reference subject
        this.checkTypeScriptSubject(trigger, script, subject);
    }

    /**
     * Verifies the trigger subject mode is allowed to be a global subject.
     */
    private checkGlobalScriptSubject(trigger: TriggerType, script: Script): void {
        const mode = trigger.subjectMode;

        // Trigger only allows global
        if (mode === SubjectMode.None) {
            this.reportError(script.name, DiagnosticMessage.SCRIPT_SUBJECT_ONLY_GLOBAL, trigger.identifier);
            return;
        }

        // Subject references a type, verify it allows global subject.
        if (this.isTypeMode(mode)) {
            if (!mode.global) {
                this.reportError(script.name, DiagnosticMessage.SCRIPT_SUBJECT_NO_GLOBAL, trigger.identifier);
            }
            return;
        }

        throw new Error(`Unexpected subject mode: ${mode}.`);
    }

    /**
     * Verifies the trigger subject mode is allowed to be a category subject.
     */
    private checkCategoryScriptSubject(trigger: TriggerType, script: Script, subject: string): void {
        const mode = trigger.subjectMode;
        const categoryType = this.categoryType;
        if (!categoryType) throw new Error("'category' type not defined.");

        // Trigger only allows global
        if (mode === SubjectMode.None) {
            this.reportError(script.name, DiagnosticMessage.SCRIPT_SUBJECT_ONLY_GLOBAL, trigger.identifier);
            return;
        }

        // Subject references a type, verify it allows category subject.
        if (this.isTypeMode(mode)) {
            if (!mode.category) {
                this.reportError(script.name, DiagnosticMessage.SCRIPT_SUBJECT_NO_CATEGORY, trigger.identifier);
                return;
            }

            // Attempt to resolve the subject to a category
            this.resolveSubjectSymbol(script, subject, categoryType);
            return;
        }

        throw new Error(`Unexpected subject mode: ${mode}.`);
    }

    /**
     * Verifies the trigger subject is allowed to refer to a type, category, or global subject.
     */
    private checkTypeScriptSubject(trigger: TriggerType, script: Script, subject: string): void {
        const mode = trigger.subjectMode;

        // Trigger only allows global
        if (mode === SubjectMode.None) {
            this.reportError(script.name, DiagnosticMessage.SCRIPT_SUBJECT_ONLY_GLOBAL, trigger.identifier);
            return;
        }

        // Subject references a type
        if (this.isTypeMode(mode)) {
            // Attempt to resolve the subject to the specified type
            this.resolveSubjectSymbol(script, subject, mode.type);
            return;
        }

        throw new Error(`Unexpected subject mode: ${mode}.`);
    }

    private tryParseMapZone(script: Script, coord: string): number {
        // Format: 'level_mx_mz'
        const parts = coord.split("_");
        if (parts.length !== 3) {
            this.reportError(script.name, "Mapzone subject must be of the form: 'level_mx_mz'.")
            return -1;
        }

        const [level, mx, mz] = parts;
        const levelInt = parseInt(level, 10);
        const mxInt = parseInt(mx, 10);
        const mzInt = parseInt(mz, 10);

        if (mxInt < 0 || mxInt > 255 || mzInt < 0 || mzInt > 255) {
            this.reportError(script.name, "Invalid mapzone coord.");
        }

        if (levelInt !== 0) {
            this.reportError(script.name, "Mapzone affect all level, just specify '0'.");
            return -1;
        }

        const x = mxInt << 6;
        const z = mzInt << 6;

        return (z & 0x3fff) | ((x & 0x3fff) << 14)
    }

    private tryParseZone(script: Script, coord: string): number {
        // Format: 'level_mx_mz_lx_lz'
        const parts = coord.split("_");
        if (parts.length !== 5) {
            this.reportError(script.name, "Zone subject must be of the form: 'level_mx_mz_lx_lz'.")
            return -1;
        }

        const [level, mx, mz, lx, lz] = parts;
        const levelInt = parseInt(level, 10);
        const mxInt = parseInt(mx, 10);
        const mzInt = parseInt(mz, 10);
        const lxInt = parseInt(lx, 10);
        const lzInt = parseInt(lz, 10);

        if (
            levelInt < 0 || levelInt > 3 ||
            mxInt < 0 || mxInt > 255 ||
            mzInt < 0 || mzInt > 255 ||
            lxInt < 0 || lxInt > 63 ||
            lzInt < 0 || lzInt > 63 
        ) {
            this.reportError(script.name, "Invalid zone coord.");
        }

        if (lxInt % 8 !== 0 || lzInt % 8 !== 0) {
            this.reportError(script.name, "Local zone coord must be a multiple of 8");
            return -1;
        }

        const x = ((mxInt << 6) | lxInt) >> 3 << 3;
        const z = ((mzInt << 6) | lzInt) >> 3 << 3;

        return (z & 0x3fff) | ((x & 0x3fff) << 14) | ((levelInt & 0x3) << 28);
    }

    /**
     * Attempts to find a reference to the subject of a script.
     */
    private resolveSubjectSymbol(script: Script, subject: string, type: Type): void {
        if (type === PrimitiveType.MAPZONE) {
            const packed = this.tryParseMapZone(script, subject);
            setScriptSubjectReference(script, new BasicSymbol(packed.toString(), type, false));
            return;
        }

        if (type === PrimitiveType.COORD) {
            const packed = this.tryParseZone(script, subject);
            setScriptSubjectReference(script, new BasicSymbol(packed.toString(), type, false));
            return;
        }

        const symbol = this.rootTable.find(SymbolType.basic(type), subject);
        if (!symbol) {
            this.reportError(script.name, DiagnosticMessage.GENERIC_UNRESOLVED_SYMBOL, subject);
            return;
        }

        if (!('type' in symbol && 'isProtected' in symbol)) {
            this.reportError(script.name, DiagnosticMessage.GENERIC_UNRESOLVED_SYMBOL, subject);
            return;
        }

        setScriptSubjectReference(script, symbol as BasicSymbol);
    }

    /**
     * Verifies the [script]s parameter types are what is allowed by the [trigger].
     */
    private checkScriptParameters(trigger: TriggerType | null, script: Script, parameters: Parameter[] | null): void {
        const triggerParameterType = trigger?.parameters;
        const scriptParameterType = getScriptParameterType(script);

        if (trigger && !trigger.allowParameters && parameters && parameters.length > 0) {
            this.reportError(parameters[0], DiagnosticMessage.SCRIPT_TRIGGER_NO_PARAMETERS, trigger.identifier);
        } else if (triggerParameterType && scriptParameterType !== triggerParameterType) {
            const expectedPArameterType = triggerParameterType.representation;
            this.reportError(script, DiagnosticMessage.SCRIPT_TRIGGER_EXPECTED_PARAMETERS, script.trigger.text, expectedPArameterType);
        }
    }

    /**
     * Verifies the [script] returns what is allowed by the [trigger].
     */
    private checkScriptReturns(trigger: TriggerType | null, script: Script): void {
        const triggerReturns = trigger?.returns;
        const scriptReturns = getScriptReturnType(script);

        if (trigger && !trigger.allowReturns && scriptReturns !== MetaType.Nothing) {
            this.reportError(script, DiagnosticMessage.SCRIPT_TRIGGER_NO_RETURNS, trigger.identifier);
        } else if (triggerReturns && scriptReturns !== triggerReturns) {
            const exprectedReturnTypes = triggerReturns.representation;
            this.reportError(
                script,
                DiagnosticMessage.SCRIPT_TRIGGER_EXPECTED_RETURNS,
                script.trigger.text,
                exprectedReturnTypes
            );
        }
    }

    override visitParameter(parameter: Parameter): void {
        const name = parameter.name.text;
        const typeText = parameter.typeToken.text;
        const type = this.typeManager.findOrNull(typeText, true);

        // Type isn't valid, report the error.
        if (!type) {
            this.reportError(parameter, DiagnosticMessage.GENERIC_INVALID_TYPE, typeText);
        }

        // Attempt to inster the local variable into the symbol talbe and display error if failed to insert.
        const symbol = new LocalVariableSymbol(name, type ?? MetaType.Error);
        const inserted = this.table.insert(SymbolType.localVariable(), symbol);

        if (!inserted) {
            this.reportError(parameter, DiagnosticMessage.SCRIPT_LOCAL_REDECLARATION, name);
        }

        setParameterSymbol(parameter, symbol);
    }

    override visitBlockStatement(blockStatement: BlockStatement): void {
        this.createScopedTable(() => {
            // Visit inner statements
            this.visit(blockStatement.statements);

            // Set the symbol table for the block.
            setBlockScope(blockStatement, this.table);
        });
    }

    override visitSwitchStatement(switchStatement: SwitchStatement): void {
        const typeName = switchStatement.typeToken.text.replace(/^switch_/, "");
        const type = this.typeManager.findOrNull(typeName);

        // Notify invalid type.
        if (!type) {
            this.reportError(switchStatement.typeToken, DiagnosticMessage.GENERIC_INVALID_TYPE, typeName);
        } else if (!type.options.allowSwitch){
            this.reportError(switchStatement.typeToken, DiagnosticMessage.SWITCH_INVALID_TYPE, type.representation);
        }

        // Visit the condition to resolve any reference.
        switchStatement.condition.accept(this);

        // Visis the cases to resolve references in them.
        this.visit(switchStatement.cases);

        // Set the expected tyep of the switch case.
        setSwitchType(switchStatement, type ?? MetaType.Error);
    }

    override visitSwitchCase(switchCase: SwitchCase): void {
        // Visit the keys to set any types that can be set early.
        this.visit(switchCase.keys);

        // Create a new scope and visit the statements in it.
        this.createScopedTable(() => {
            this.visit(switchCase.statements);

            // Set the symbol table for the block
            setSwitchCaseScope(switchCase, this.table);
        });
        
    }

    override visitNode(node: Node): void {
        this.visit(node.children)
    }

    /**
     * Helper function to report a diagnostic with the type of [DiagnosticType.INFO].
     */
    private reportInfo(node: Node, message: string, ...args: unknown[]) {
        this.diagnostics.report(new Diagnostic(DiagnosticType.INFO, node, message, ...args));
    }

    /**
     * Helper function to report a diagnostic with the type of [DiagnosticType.WARNING].
     */
    private reportWarning(node: Node, message: string, ...args: unknown[]) {
        this.diagnostics.report(new Diagnostic(DiagnosticType.WARNING, node, message, ...args));
    }

    /**
     * Helper function to report a diagnostic with the type of [DiagnosticType.ERROR].
     */
    private reportError(node: Node, message: string, ...args: unknown[]) {
        this.diagnostics.report(new Diagnostic(DiagnosticType.ERROR, node, message, ...args))
    }

    /**
     * Calls [Node.accept] on all nodes in a list.
     */
    private visit(nodes: readonly Node[]) {
        for (const n of nodes) {
            n.accept(this);
        }
    }
}