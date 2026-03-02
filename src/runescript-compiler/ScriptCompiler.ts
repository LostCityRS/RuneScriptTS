import fs from 'fs';
import path from 'path';

import { CharStream } from 'antlr4ng';

import { ParserErrorListener } from '#/runescript-compiler/ParserErrorListener.js';

import { CodeGenerator } from '#/runescript-compiler/codegen/CodeGenerator.js';

import { RuneScript } from '#/runescript-compiler/codegen/script/RuneScript.js';

import { PointerChecker } from '#/runescript-compiler/codegen/script/config/PointerChecker.js';

import { SymbolLoader } from '#/runescript-compiler/configuration/SymbolLoader.js';

import { DynamicCommandHandler } from '#/runescript-compiler/configuration/command/DynamicCommandHandler.js';

import { Diagnostics } from '#/runescript-compiler/diagnostics/Diagnostics.js';
import { BaseDiagnosticsHandler, DiagnosticsHandler } from '#/runescript-compiler/diagnostics/DiagnosticsHandler.js';

import { PointerHolder } from '#/runescript-compiler/pointer/PointerHolder.js';

import { MacroProcessor, MacroRegistry, MacroExpansionSpan } from '#/runescript-compiler/preprocess/MacroProcessor.js';

import { StrictFeatureLevel } from '#/runescript-compiler/StrictFeatureLevel.js';

import { ScriptRegistration } from '#/runescript-compiler/semantics/ScriptRegistration.js';
import { TypeChecking } from '#/runescript-compiler/semantics/TypeChecking.js';

import { SymbolTable } from '#/runescript-compiler/symbol/SymbolTable.js';

import { CommandTrigger } from '#/runescript-compiler/trigger/CommandTrigger.js';
import { TriggerManager } from '#/runescript-compiler/trigger/TriggerManager.js';

import { MetaType } from '#/runescript-compiler/type/MetaType.js';
import { PrimitiveType } from '#/runescript-compiler/type/PrimitiveType.js';
import { TupleType } from '#/runescript-compiler/type/TupleType.js';
import type { Type } from '#/runescript-compiler/type/Type.js';
import { TypeManager } from '#/runescript-compiler/type/TypeManager.js';

import { ScriptWriter } from '#/runescript-compiler/writer/ScriptWriter.js';

import { ScriptFile } from '#/runescript-parser/ast/ScriptFile.js';

import { ScriptParser } from '#/runescript-parser/parser/ScriptParser.js';

/**
 * An entry point for compiling scripts.
 */
export class ScriptCompiler {
    /**
     * Log directly to console for now.
     */
    private readonly logger = console;

    /**
     * The paths that contain the source code.
     */
    private readonly sourcePaths: readonly string[];

    /**
     * The paths that contain source code that is (mostly) excluded.
     */
    private readonly excludePaths: readonly string[];

    /**
     * The root table that contains all global symbols.
     */
    private readonly rootTable = new SymbolTable();

    /**
     * A list of [SymbolLoader]s called before attempting compilation.
     */
    private readonly symbolLoaders: SymbolLoader[] = [];

    /**
     * A mapping of command names to their handler implementation.
     */
    private readonly dynamicCommandHandlers = new Map<string, DynamicCommandHandler>();

    /**
     * The [TypeManager] for the compiler that is used for registering and looking up types.
     */
    public readonly types: TypeManager = new TypeManager();

    /**
     * The [TriggerManager] for the compiler that is used for registering and looking up script triggers.
     */
    public readonly triggers: TriggerManager = new TriggerManager();

    public static readonly DEFAULT_DIAGNOSTICS_HANDLER: DiagnosticsHandler = new BaseDiagnosticsHandler();

    /**
     * Called after every step with all diagnostics that were collected during it.
     */
    public diagnosticsHandler: DiagnosticsHandler = ScriptCompiler.DEFAULT_DIAGNOSTICS_HANDLER;

    protected features: StrictFeatureLevel;

    constructor(
        sourcePaths: string[],
        excludePaths: string[],
        private readonly scriptWriter: ScriptWriter,
        protected readonly commandPointers: Map<string, PointerHolder>,
        features: StrictFeatureLevel = {}
    ) {
        this.features = features;

        // Normalize paths.
        this.sourcePaths = sourcePaths.map(p => this.normalizePath(p));
        this.excludePaths = excludePaths.map(p => this.normalizePath(p));

        // Register core types.
        this.types.registerAll(PrimitiveType);
        this.types.register(MetaType.Any);
        this.types.register('type', MetaType.Any);

        this.setupDefaultTypeCheckers();

        // Register the command trigger.
        this.triggers.registerTrigger(CommandTrigger);
    }

    /**
     * Adds the core type checkers that the compiler depends on.
     */
    private setupDefaultTypeCheckers(): void {
        // Allow anything to be assigned to any (top type).
        this.types.addTypeChecker((left, _) => left === MetaType.Any);

        // Allow nothing to be assigned to any (bottom type).
        // this.types.addTypeChecker((_, right) => right === MetaType.Nothing);

        // Allow anything to be assigned to error to prevent error propagation.
        this.types.addTypeChecker((left, right) => left === MetaType.Error || right === MetaType.Error);

        // Basic checker where both types are equal.
        this.types.addTypeChecker((left, right) => left === right);

        // Checker for [MetaData.Script] that compares parameter and return types.
        this.types.addTypeChecker(
            (left, right) => left instanceof MetaType.Script && right instanceof MetaType.Script && left.trigger === right.trigger && this.types.check(left.parameterType, right.parameterType) && this.types.check(left.returnType, right.returnType)
        );

        // Checker for [MetaType.Hook] that compares the trigger list type.
        this.types.addTypeChecker((left, right) => left instanceof MetaType.Hook && right instanceof MetaType.Hook && this.types.check(left.transmitListType, right.transmitListType));

        // Checker for [WrappedType] that compares the inner types.
        // Check for 'inner' property since WrappedType is implemented, not extended
        this.types.addTypeChecker((left, right) => {
            const leftHasInner = 'inner' in left && left.inner != null;
            const rightHasInner = 'inner' in right && right.inner != null;

            if (!leftHasInner || !rightHasInner) {
                return false;
            }

            if (left.constructor.name !== right.constructor.name) {
                return false;
            }

            // Type assertion: we've verified left.inner and right.inner exist
            return this.types.check((left as any).inner, (right as any).inner);
        });

        // Checker for [TupleType] that compares all children.
        this.types.addTypeChecker((left, right) => {
            if (!(left instanceof TupleType) || !(right instanceof TupleType)) {
                return false;
            }
            if (left.children.length !== right.children.length) {
                return false;
            }
            for (let i = 0; i < left.children.length; i++) {
                if (!this.types.check(left.children[i], right.children[i])) {
                    return false;
                }
            }
            return true;
        });

        // Fallback checker: compare types by their string representation.
        // This handles cases where dynamically created types have the same structure
        // but are different instances (e.g., TupleTypes created in different contexts).
        this.types.addTypeChecker((left, right) => {
            return left.representation === right.representation;
        });
    }

    /**
     * Adds [loader] to the list of symbol loaders to run pre-compilation. This
     * can be used to load external symbols outside of scripts.
     */
    public addSymbolLoader(loader: SymbolLoader): void {
        this.symbolLoaders.push(loader);
    }

    /**
     * Adds a [DynamicCommandHandler] to the compiler with the given [name].
     * See [DynamicCommandHandler] for information on implementation.
     *
     * If a handler was registered for the [name] already an error is thrown.
     */
    public addDynamicCommandHandler(name: string, handler: DynamicCommandHandler): void {
        if (this.dynamicCommandHandlers.has(name)) {
            throw new Error(`A dynamic command handler with the name of '${name}' already exists.`);
        }

        this.dynamicCommandHandlers.set(name, handler);
    }

    /**
     * Runs the compiler by loading external symbols then actual
     * running the compile process.
     */
    public run(ext: string): void {
        this.loadSymbols();
        this.compile(ext);
        if ('close' in this.scriptWriter) {
            (this.scriptWriter as any).close();
        }
    }

    /**
     * Calls all [SymbolLoader]s added to the compiler.
     */
    private loadSymbols(): void {
        for (const symbolLoader of this.symbolLoaders) {
            symbolLoader.load(this.rootTable, this);
        }
    }

    /**
     * Initializes the actual compile pipeline.
     */
    private compile(ext: string): void {
        // 1) Parse all files.
        const [parseSuccess, fileNodes] = this.parse(ext);
        if (!parseSuccess) {
            return;
        }

        // 2) Analyze the nodes.
        const analyzeSuccess = this.analyze(fileNodes);
        if (!analyzeSuccess) {
            return;
        }

        // 3) Generate code
        const [codeGenSuccess, scripts] = this.codegen(fileNodes);
        if (!codeGenSuccess) {
            return;
        }

        // 4) Check pointers
        const pointerCheckSuccess = this.checkPointers(scripts);
        if (!pointerCheckSuccess) {
            return;
        }

        // 5) Write scripts
        this.write(scripts);
    }

    /**
     * Parses all files in the source path and returns the parsed AST nodes.
     */
    private parse(ext: string): [boolean, ScriptFile[]] {
        const diagnostics = new Diagnostics();
        const fileNodes: ScriptFile[] = [];
        let fileCount = 0;
        // const start = performance.now();

        const macroRegistry = new MacroRegistry();
        const macroExpansionMap = new Map<string, MacroExpansionSpan[]>();
        if (this.features.macros !== false) {
            this.attachMacroLookup(macroExpansionMap, macroRegistry);

            for (const sourcePath of this.sourcePaths) {
                const files = this.walkTopDown(sourcePath);
                for (const file of files) {
                    if (!file.endsWith('.macro')) {
                        continue;
                    }

                    MacroProcessor.parseMacroFile(file, macroRegistry, diagnostics);
                }
            }
        }

        for (const sourcePath of this.sourcePaths) {
            // this.logger.debug(`Parsing files in '${sourcePath}'.`);

            // Recursively walk all files.
            const files = this.walkTopDown(sourcePath);

            for (const file of files) {
                if (!file.endsWith(`.${ext}`)) {
                    continue;
                }

                //this.logger.debug(`Attempting to parse: ${file}.`);

                const errorListener = new ParserErrorListener(file, diagnostics);
                let node: ScriptFile | null = null;

                if (this.features.macros !== false) {
                    // macros enabled: need to expand them
                    const rawSource = fs.readFileSync(file, 'utf8');
                    const expandedResult = MacroProcessor.expandSourceWithMap(rawSource, macroRegistry, diagnostics, file);
                    const expanded = expandedResult.text;
                    macroExpansionMap.set(path.resolve(file), expandedResult.spans);

                    const stream = CharStream.fromString(expanded);
                    stream.name = file;

                    node = ScriptParser.invokeParser(stream, parser => parser.scriptFile(), errorListener) as ScriptFile | null;
                } else {
                    // macros disabled
                    node = ScriptParser.createScriptFile(file, errorListener);
                }

                if (node) {
                    fileNodes.push(node);
                }

                fileCount++;
            }
        }
        // const time = (performance.now() - start).toFixed(2);
        // this.logger.debug(`Parsed ${fileCount} files in ${time}ms.`);
        this.diagnosticsHandler.handleParse?.(diagnostics);

        return [diagnostics.hasErrors() === false, fileNodes];
    }

    /**
     * Runs all [files] through the semantic analysis pipeline. If there were any errors,
     * the program will be halted with the exit code `1`.
     */
    private analyze(files: ScriptFile[]): boolean {
        const diagnostics = new Diagnostics();

        // Script registration: This adds all scripts to the symbol table for lookup in the next phase.
        // this.logger.debug("Starting script registration.");
        // const scriptRegistrationStart = performance.now();

        const scriptRegistration = new ScriptRegistration(this.types, this.triggers, this.rootTable, diagnostics, this.features);
        for (const file of files) {
            // const fileStart = performance.now();
            file.accept(scriptRegistration);
            // const fileTime = (performance.now() - fileStart).toFixed(2);
            // this.logger.debug(`Registered scripts in ${file.source.name} in ${fileTime}ms.`);
        }

        // const scriptRegistrationTime = (performance.now() - scriptRegistrationStart).toFixed(2);
        // this.logger.debug(`Finished script registration in ${scriptRegistrationTime}ms.`);

        // Type check: This does all major type checking.
        // this.logger.debug("Starting type checking.");
        // const typeStart = performance.now();

        const typeChecking = new TypeChecking(this.types, this.triggers, this.rootTable, this.dynamicCommandHandlers, diagnostics, this.features);
        for (const file of files) {
            // const fileStart = performance.now();
            file.accept(typeChecking);
            // const fileTime = (performance.now() - fileStart).toFixed(2);
            //this.logger.debug(`Type checked ${file.source.name} in ${fileTime}ms.`);
        }

        // const typeCheckingTime = (performance.now() - typeStart).toFixed(2);
        // this.logger.debug(`Finished type checking in ${typeCheckingTime}ms.`);

        // Call the diagnostics handler.
        this.diagnosticsHandler.handleTypeChecking?.(diagnostics);

        return !diagnostics.hasErrors();
    }

    /**
     * Runs all [files] through the code generator. Returns a list of all generated [RuneScript].
     * If there were any errors, the program will be halted with exit code `1`.
     */
    private codegen(files: ScriptFile[]): [boolean, RuneScript[]] {
        const diagnostics = new Diagnostics();

        /**
         * Run each file through the code generator and fetch the scripts from the generator
         * and add to a list that we return.
         */
        const scripts: RuneScript[] = [];
        // this.logger.debug("Starting codegen.");
        // const codeGenStart = performance.now();
        for (const file of files) {
            // const fileStart = performance.now();
            const codeGen = new CodeGenerator(this.rootTable, this.dynamicCommandHandlers, diagnostics);
            file.accept(codeGen);
            scripts.push(...codeGen.scripts);
            // const fileTime = (performance.now() - fileStart).toFixed(2);
            //this.logger.debug(`Generated code for ${file.source.name} in ${fileTime}ms.`);
        }
        // const codeGenTime = (performance.now() - codeGenStart).toFixed(2);
        // this.logger.debug(`Finished codegen in ${codeGenTime}ms.`);

        // Call the diagnostics handler.
        this.diagnosticsHandler.handleCodeGeneration?.(diagnostics);

        return [diagnostics.hasErrors() === false, scripts];
    }

    private checkPointers(scripts: RuneScript[]): boolean {
        if (this.commandPointers.size < 1) {
            // Early return if there is no pointer information for any command.
            return false;
        }

        const diagnostics = new Diagnostics();

        const pointerChecker = this.createPointerChecker(diagnostics, scripts);
        // this.logger.debug("Starting pointer checking.");
        // const pointerCheckStart = performance.now();
        pointerChecker.run();
        // const pointerCheckTime = (performance.now() - pointerCheckStart).toFixed(2);
        // this.logger.debug(`Finished pointer checking in ${pointerCheckTime}ms.`);

        // Call the diagnostics handler.
        this.diagnosticsHandler.handlePointerChecking?.(diagnostics);

        return !diagnostics.hasErrors();
    }

    protected createPointerChecker(diagnostics: Diagnostics, scripts: RuneScript[]): PointerChecker {
        return new PointerChecker(diagnostics, scripts, this.commandPointers, this.features);
    }

    /**
     * Runs all [scripts] through the [ScriptWriter].
     */
    private write(scripts: RuneScript[]) {
        // this.logger.debug("Starting script writing.");
        // const scriptWriterStart = performance.now();
        for (const script of scripts) {
            if (this.isExcluded(script.sourceName)) {
                // this.logger.debug(`Skipping writing of excluded file: ${script.sourceName}`);
                continue;
            }

            // const scriptWriteTimeStart = performance.now();
            this.scriptWriter.write(script);
            // const scriptWriteTime = (performance.now() - scriptWriteTimeStart).toFixed(2);
            //this.logger.debug(`Wrote ${script.fullName} in ${scriptWriteTime}ms.`);
        }
        // const scriptWriterTime = (performance.now() - scriptWriterStart).toFixed(2);
        // this.logger.debug(`Finished script writing in ${scriptWriterTime}ms.`);
    }

    /**
     * Checks if [sourceName] is within any of the excluded paths.
     * Invalid [Path]s return with `false`.
     */
    private isExcluded(sourceName: string): boolean {
        let sourcePath: string;

        try {
            // Normalize + resolve
            sourcePath = path.normalize(path.resolve(sourceName));
        } catch {
            // Not a valid source path so the exclusions are not relevant.
            return false;
        }

        return this.excludePaths.some(excluded => {
            const excludedPath = path.normalize(excluded);

            return sourcePath === excludedPath || sourcePath.startsWith(excludedPath + path.sep);
        });
    }

    /**
     * Helper functions
     */
    normalizePath(p: string): string {
        return path.normalize(path.resolve(p));
    }

    private attachMacroLookup(macroExpansionMap: Map<string, MacroExpansionSpan[]>, macroRegistry: MacroRegistry): void {
        const handler = this.diagnosticsHandler;
        if (!(handler instanceof BaseDiagnosticsHandler)) {
            return;
        }

        handler.setMacroLookup((sourceName, line, column) => {
            const resolved = path.resolve(sourceName);
            const spans = macroExpansionMap.get(resolved) ?? macroExpansionMap.get(sourceName);
            if (!spans || spans.length === 0) {
                return null;
            }

            let best: MacroExpansionSpan | null = null;
            for (const span of spans) {
                if (line < span.startLine || line > span.endLine) {
                    continue;
                }
                if (line === span.startLine && column < span.startColumn) {
                    continue;
                }
                if (line === span.endLine && column > span.endColumn) {
                    continue;
                }

                if (!best) {
                    best = span;
                    continue;
                }

                const bestSize = (best.endLine - best.startLine) * 100000 + (best.endColumn - best.startColumn);
                const spanSize = (span.endLine - span.startLine) * 100000 + (span.endColumn - span.startColumn);
                if (spanSize < bestSize) {
                    best = span;
                }
            }

            if (!best) {
                return null;
            }

            let originLine = best.macroLine;
            let originColumn = 1;
            const macro = macroRegistry.macros.get(best.macroName);
            if (macro && line === best.startLine) {
                const offset = Math.max(0, column - best.startColumn);
                const substituted = MacroProcessor.applyArgs(macro.body, macro.args, best.argValues);
                const mapped = MacroProcessor.mapFlatIndexToLineCol(substituted, offset);
                if (mapped) {
                    originLine = macro.line + mapped.line;
                    originColumn = mapped.column;
                }
            }

            return {
                callSiteLine: best.callSiteLine,
                callSiteColumn: best.callSiteColumn,
                origin: {
                    name: best.macroName,
                    file: best.macroFile,
                    line: originLine,
                    column: originColumn
                }
            };
        });
    }

    /**
     * Should match Kotlin's recursive depth-first iteration close enough.
     */
    private walkTopDown(dir: string): string[] {
        let results: string[] = [];
        for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
            const fullPath = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                results = results.concat(this.walkTopDown(fullPath));
            } else {
                results.push(fullPath);
            }
        }
        return results;
    }
}
