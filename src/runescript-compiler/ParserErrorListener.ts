import { ANTLRErrorListener, RecognitionException, Recognizer } from 'antlr4ts';
import { Diagnostics } from './diagnostics/Diagnostics';
import { NodeSourceLocation } from '../runescipt-parser/ast/NodeSourceLocation';
import { Diagnostic } from './diagnostics/Diagnostic';
import { DiagnosticType } from './diagnostics/DiagnosticType';

/**
 * An antlr error listener that adds the error to [Diagnostics] for reporting later.
 */
export class ParserErrorListener<T> implements ANTLRErrorListener<T> {
    constructor(
        private sourceFile: string,
        private diagnostics: Diagnostics,
        private lineOffset: number = 0,
        private columnOffset: number = 0
    ){}

    syntaxError(
        recognizer: Recognizer<T, any>,
        offendingSymbol: T | undefined,
        line: number,
        charPositionInLine: number,
        msg: string,
        e: RecognitionException | undefined
    ): void {
        // Column offset only if we're on the first line since new line will reset the offset.
        const adjustedColumnOffset = line === 1 ? this.columnOffset : 0;

        const realLine = line + this.lineOffset;
        const realColumn = charPositionInLine + adjustedColumnOffset + 1;
        const source = new NodeSourceLocation(this.sourceFile, realLine, realColumn);

        this.diagnostics.report(
            new Diagnostic(DiagnosticType.SYNTAX_ERROR, source, msg.replace(/%/g, "%%"), [])
        );
    }
}