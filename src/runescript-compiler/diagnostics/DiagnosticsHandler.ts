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

/**
 * A base implementation of a diagnostics handler that points to the line an error occurs on
 * and exits the process with exit code `1` if there were any errors during any steps.
 */
export class BaseDiagnosticsHandler implements DiagnosticsHandler {
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
            const location = `${diag.sourceLocation.name}:${diag.sourceLocation.line}:${diag.sourceLocation.column}`;

            console.log(`${location}: ${diag.type}: ${util.format(diag.message, ...diag.messageArgs)}`);

            const lineIndex = diag.sourceLocation.line - 1;

            if (lineIndex >= 0 && lineIndex < lines.length) {
                const line = lines[lineIndex];
                const lineNoTabs = line.replace(/\t/g, '    ');
                const tabCount = (line.match(/\t/g) ?? []).length;

                const rawColumn = diag.sourceLocation.column ?? 1;
                const column = Math.max(1, rawColumn);

                const caretOffset = Math.max(0, tabCount * 3 + (column - 1));

                console.log(`    > ${lineNoTabs}`);
                console.log(`    > ${' '.repeat(caretOffset)}^`);
            }
        }

        if (diagnostics.hasErrors()) {
            process.exit(1);
        }
    }
}
