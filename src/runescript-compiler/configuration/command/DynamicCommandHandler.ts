import { Diagnostic } from '../../diagnostics/Diagnostic';
import { Diagnostics } from '../../diagnostics/Diagnostics';
import { DiagnosticType } from '../../diagnostics/DiagnosticType';
import { TypeCheckingContext } from './TypeCheckingContext';
import { Node } from '../../../runescipt-parser/ast/Node';
import { CodeGeneratorContext } from './CodeGeneratorContext';

/**
 * A dynamic command handler allows more complex commands to be implemented.
 * Implementations are able to do custom type checking and code generation,
 * which allows for some commands to be implemented properly.
 *
 * A lot of implementations may not need to supply custom code generation,
 * which in that case they can omit `generateCode`.
 */
export interface DynamicCommandHandler {
    /**
     * Handles type checking the expression. The expression will only ever be [CallExpression] or [Identifier].
     *
     * All implementations should follow these basic rules:
     *  - `expression.type` **must** be defined.
     *  - If `expression.symbol` is not defined, an attempt is made to look up a predefined symbol in the root
     *  table. If a predefined symbol wasn't found an internal compiler error will be thrown.
     *  - Errors should be reported using `reportError`.
     */
    typeCheck(context: TypeCheckingContext): void;

    /**
     * Handles code generation for the command call.
     */
    generateCode?(context: CodeGeneratorContext): void;
}

/**
 * Helper function to report a diagnostic with the type of [DiagnosticType.INFO].
 */
export function reportInfo(node: Node, diagnostics: Diagnostics, message: string, ...args: any[]): void {
    diagnostics.report(new Diagnostic(DiagnosticType.INFO, node, message, ...args));
}

/**
 * Helper function to report a diagnostic with the type of [DiagnosticType.WARNING].
 */
export function reportWarning(node: Node, diagnostics: Diagnostics, message: string, ...args: any[]): void {
    diagnostics.report(new Diagnostic(DiagnosticType.WARNING, node, message, ...args));
}

/**
 * Helper function to report a diagnostic with the type of [DiagnosticType.ERROR].
 */
export function reportError(node: Node, diagnostics: Diagnostics, message: string, ...args: any[]): void {
    diagnostics.report(new Diagnostic(DiagnosticType.ERROR, node, message, ...args));
}