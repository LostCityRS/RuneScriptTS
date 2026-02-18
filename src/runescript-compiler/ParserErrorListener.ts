import { ANTLRErrorListener, RecognitionException, Recognizer, type ATNConfigSet, type BitSet, type DFA, type Parser } from 'antlr4ng';
import { Diagnostics } from './diagnostics/Diagnostics';
import { NodeSourceLocation } from '../runescipt-parser/ast/NodeSourceLocation';
import { Diagnostic } from './diagnostics/Diagnostic';
import { DiagnosticType } from './diagnostics/DiagnosticType';

/**
 * An antlr error listener that adds the error to [Diagnostics] for reporting later.
 */
export class ParserErrorListener implements ANTLRErrorListener {
    constructor(
        private sourceFile: string,
        private diagnostics: Diagnostics,
        private lineOffset: number = 0,
        private columnOffset: number = 0
    ){}

    syntaxError<T>(
        recognizer: Recognizer<any> | undefined,
        offendingSymbol: any,
        line: number,
        charPositionInLine: number,
        msg: string,
        e: RecognitionException | undefined
    ): void {
        // Column offset only if we're on the first line since new line will reset the offset.
        const adjustedColumnOffset = line === 1 ? this.columnOffset : 0;

        const realLine = line + this.lineOffset;
        const realColumn = charPositionInLine + adjustedColumnOffset + 1;
        const source: NodeSourceLocation = {
            name: this.sourceFile,
            line: realLine,
            column: realColumn,
            endLine: realLine,
            endColumn: realColumn
        };

        this.diagnostics.report(
            new Diagnostic(DiagnosticType.SYNTAX_ERROR, source, msg.replace(/%/g, "%%"), [])
        );
    }

    reportAmbiguity(recognizer: Parser, dfa: DFA, startIndex: number, stopIndex: number, exact: boolean, ambigAlts: BitSet | undefined, configs: ATNConfigSet): void {
    }

    reportAttemptingFullContext(recognizer: Parser, dfa: DFA, startIndex: number, stopIndex: number, conflictingAlts: BitSet | undefined, configs: ATNConfigSet): void {
    }

    reportContextSensitivity(recognizer: Parser, dfa: DFA, startIndex: number, stopIndex: number, prediction: number, configs: ATNConfigSet): void {
    }
}