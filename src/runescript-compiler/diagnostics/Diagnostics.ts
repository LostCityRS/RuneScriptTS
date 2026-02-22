import { Diagnostic } from '#/runescript-compiler/diagnostics/Diagnostic.js';
import { DiagnosticType } from '#/runescript-compiler/diagnostics/DiagnosticType.js';

/**
 * Contains a list of [Diagnostics] reported during a compilation step.
 */
export class Diagnostics {
    /**
     * Private mutable list of [Diagnostic]s.
     */
    private readonly _diagnostics: Diagnostic[] = [];

    /**
     * Immutable list of [Diagnostic]s reported.
     *
     * @see report
     */
    public get diagnostics(): ReadonlyArray<Diagnostic> {
        return this._diagnostics;
    }

    /**
     * Adds the [diagnostic] to the list.
     */
    public report(diagnostic: Diagnostic): void {
        this._diagnostics.push(diagnostic);
    }

    /**
     * Checks if any of the reported [Diagnostic]s have an error type.
     */
    public hasErrors(): boolean {
        return this._diagnostics.some(d => Diagnostics.ERROR_TYPES.has(d.type));
    }

    /**
     * All [DiagnosticType]s that count as errors during compilation.
     */
    private static readonly ERROR_TYPES: Set<DiagnosticType> = new Set([DiagnosticType.ERROR, DiagnosticType.SYNTAX_ERROR]);
}
