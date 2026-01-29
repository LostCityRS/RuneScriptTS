import { Diagnostics } from './Diagnostics';
import * as fs from "fs";
import * as path from "path";

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
export class BaseDiagnosticsHandler {
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
                fileLines.set(filePath, fs.readFileSync(filePath, "utf-8").split("\n"));
            }

            const lines = fileLines.get(filePath)!;
            const location = `${diag.sourceLocation.name}:${diag.sourceLocation.line}:${diag.sourceLocation.column}`;

            console.log(`${location}: ${diag.type}: ${diag.message}`);

            if (diag.sourceLocation.line - 1 < lines.length) {
                const line = lines[diag.sourceLocation.line - 1];
                const lineNoTabs = line.replace(/\t/g, "    ");
                const tabCount = (line.match(/\t/g) || []).length;
                console.log(`    > ${lineNoTabs}`);
                console.log(`    > ${" ".repeat(tabCount * 3 + (diag.sourceLocation.column - 1))}^`);
            }
        }

        if (diagnostics.hasErrors()) {
            process.exit(1);
        }
    }
}    