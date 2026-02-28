import fs from 'fs';
import path from 'path';
import util from 'util';

import { Diagnostics } from '#/runescript-compiler/diagnostics/Diagnostics.js';

/**
 * Allows handling diagnostics for different parts of the compiler process.
 */
export interface DiagnosticsHandler {
    /**
     * Allows handling diagnostics after the parse step.
     */
    handleParse?(diagnostics: Diagnostics): void;

    /**
     * Allows handling diagnostics after the type checking step.
     */
    handleTypeChecking?(diagnostics: Diagnostics): void;

    /**
     * Allows handling diagnostics after the code generation step.
     */
    handleCodeGeneration?(diagnostics: Diagnostics): void;

    /**
     * Allows handling diagnostics after pointer checking step.
     */
    handlePointerChecking?(diagnostics: Diagnostics): void;
}

export interface MacroOrigin {
    name: string;
    file: string;
    line: number;
    column: number;
}

export interface MacroLookupResult {
    callSiteLine: number;
    callSiteColumn: number;
    origin: MacroOrigin;
}

export type MacroLookup = (sourceName: string, line: number, column: number) => MacroLookupResult | null;

/**
 * A base implementation of a diagnostics handler that points to the line an error occurs on
 * and exits the process with exit code `1` if there were any errors during any steps.
 */
export class BaseDiagnosticsHandler implements DiagnosticsHandler {
    private macroLookup?: MacroLookup;

    public setMacroLookup(lookup: MacroLookup | null): void {
        this.macroLookup = lookup ?? undefined;
    }

    handleParse(diagnostics: Diagnostics): void {
        this.handleShared(diagnostics);
    }

    handleTypeChecking(diagnostics: Diagnostics): void {
        this.handleShared(diagnostics);
    }

    handleCodeGeneration(diagnostics: Diagnostics): void {
        this.handleShared(diagnostics);
    }

    handlePointerChecking(diagnostics: Diagnostics): void {
        this.handleShared(diagnostics);
    }

    private handleShared(diagnostics: Diagnostics): void {
        const fileLines: Map<string, string[]> = new Map();

        for (const diag of diagnostics.diagnostics) {
            const filePath = path.resolve(diag.sourceLocation.name);

            // Lazy load file lines
            if (!fileLines.has(filePath)) {
                fileLines.set(filePath, fs.readFileSync(filePath, 'utf-8').split(/\r?\n/));
            }

            const lines = fileLines.get(filePath)!;

            let displayLine = diag.sourceLocation.line;
            let displayColumn = diag.sourceLocation.column ?? 1;
            let macroResult: MacroLookupResult | null = null;
            if (this.macroLookup) {
                macroResult = this.macroLookup(diag.sourceLocation.name, displayLine, displayColumn);
                if (macroResult) {
                    displayLine = macroResult.callSiteLine;
                    displayColumn = macroResult.callSiteColumn;
                }
            }

            const location = `${diag.sourceLocation.name}:${displayLine}:${displayColumn}`;

            console.log(`${location}: ${diag.type}: ${util.format(diag.message, ...diag.messageArgs)}`);

            const lineIndex = displayLine - 1;

            if (lineIndex >= 0 && lineIndex < lines.length) {
                const line = lines[lineIndex];
                const lineNoTabs = line.replace(/\t/g, '    ');
                const tabCount = (line.match(/\t/g) ?? []).length;

                const rawColumn = displayColumn;
                const column = Math.max(1, rawColumn);

                const caretOffset = Math.max(0, tabCount * 3 + (column - 1));

                console.log(`    > ${lineNoTabs}`);
                console.log(`    > ${' '.repeat(caretOffset)}^`);
            }

            if (macroResult) {
                const origin = macroResult.origin;
                const originPath = path.resolve(origin.file);
                if (!fileLines.has(originPath)) {
                    fileLines.set(originPath, fs.readFileSync(originPath, 'utf-8').split(/\r?\n/));
                }
                const originLines = fileLines.get(originPath)!;
                const originLineIndex = origin.line - 1;
                let originColumn = Math.max(1, origin.column);
                let originLineText = '';
                if (originLineIndex >= 0 && originLineIndex < originLines.length) {
                    originLineText = originLines[originLineIndex];
                }

                console.log(`${origin.file}:${origin.line}:${originColumn}: NOTE: expanded from macro '${origin.name}'`);
                if (originLineText) {
                    const originLineNoTabs = originLineText.replace(/\t/g, '    ');
                    const originTabCount = (originLineText.match(/\t/g) ?? []).length;
                    const caretOffset = Math.max(0, originTabCount * 3 + (originColumn - 1));
                    console.log(`    > ${originLineNoTabs}`);
                    console.log(`    > ${' '.repeat(caretOffset)}^`);
                }
            }
        }

        if (diagnostics.hasErrors()) {
            process.exit(1);
        }
    }
}
