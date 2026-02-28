import fs from 'fs';

import { Diagnostic } from '#/runescript-compiler/diagnostics/Diagnostic.js';
import { DiagnosticType } from '#/runescript-compiler/diagnostics/DiagnosticType.js';
import { Diagnostics } from '#/runescript-compiler/diagnostics/Diagnostics.js';

import type { NodeSourceLocation } from '#/runescript-parser/ast/NodeSourceLocation.js';

export interface MacroDefinition {
    name: string;
    body: string;
    file: string;
    line: number;
    args: string[];
}

export interface MacroExpansionSpan {
    startLine: number;
    startColumn: number;
    endLine: number;
    endColumn: number;
    callSiteLine: number;
    callSiteColumn: number;
    argValues: string[];
    macroName: string;
    macroFile: string;
    macroLine: number;
}

export interface MacroExpansionResult {
    text: string;
    spans: MacroExpansionSpan[];
}

export class MacroRegistry {
    public readonly macros = new Map<string, MacroDefinition>();
}

export class MacroProcessor {
    private static readonly DEFINE_RE = /^\s*#define\s+([a-zA-Z0-9_+.:]+)\s*,(.*)$/;
    private static readonly ENDDEF_RE = /^\s*#enddef\b/;

    public static parseMacroFile(filePath: string, registry: MacroRegistry, diagnostics: Diagnostics): void {
        const source = fs.readFileSync(filePath, 'utf8');
        const lines = source.split(/\r?\n/);

        let inMacro = false;
        let macroName = '';
        let macroArgs: string | null = null;
        let macroStartLine = 0;
        let macroBody: string[] = [];

        for (let index = 0; index < lines.length; index++) {
            const rawLine = lines[index];
            const line = this.stripLineComment(rawLine);

            if (inMacro) {
                if (this.ENDDEF_RE.test(line)) {
                    if (registry.macros.has(macroName)) {
                        this.report(
                            diagnostics,
                            filePath,
                            macroStartLine,
                            1,
                            `Macro '${macroName}' is already defined.`
                        );
                    } else {
                        const argList = macroArgs
                            ? macroArgs
                                  .split(',')
                                  .map(arg => arg.trim())
                                  .filter(arg => arg.length > 0)
                            : [];
                        registry.macros.set(macroName, {
                            name: macroName,
                            body: macroBody.join('\n'),
                            file: filePath,
                            line: macroStartLine,
                            args: argList
                        });
                    }
                    inMacro = false;
                    macroName = '';
                    macroArgs = null;
                    macroStartLine = 0;
                    macroBody = [];
                    continue;
                }

                macroBody.push(rawLine);
                continue;
            }

            if (this.ENDDEF_RE.test(line)) {
                this.report(diagnostics, filePath, index + 1, 1, 'Encountered #enddef without a matching #define.');
                continue;
            }

            const defineMatch = this.DEFINE_RE.exec(line);
            if (defineMatch) {
                inMacro = true;
                macroName = defineMatch[1];
                macroArgs = defineMatch[2]?.trim() ?? null;
                macroStartLine = index + 1;
                macroBody = [];
                continue;
            }
        }

        if (inMacro) {
            this.report(diagnostics, filePath, macroStartLine, 1, `Macro '${macroName}' is missing a closing #enddef.`);
        }
    }

    public static expandSource(source: string, registry: MacroRegistry, diagnostics: Diagnostics, sourceName: string): string {
        return this.expandSourceInternal(source, registry, diagnostics, sourceName, [], false).text;
    }

    public static expandSourceWithMap(source: string, registry: MacroRegistry, diagnostics: Diagnostics, sourceName: string): MacroExpansionResult {
        return this.expandSourceInternal(source, registry, diagnostics, sourceName, [], false);
    }

    private static expandSourceInternal(source: string, registry: MacroRegistry, diagnostics: Diagnostics, sourceName: string, stack: string[], collapseNewlines: boolean): MacroExpansionResult {
        const out: string[] = [];
        const spans: MacroExpansionSpan[] = [];
        let index = 0;
        const sourceLength = source.length;

        let inLineComment = false;
        let inBlockComment = false;
        let inString = false;
        let inStringExpr = false;
        let inChar = false;

        let outputLine = 1;
        let outputColumn = 1;
        let inputLine = 1;
        let inputColumn = 1;

        const append = (text: string) => {
            if (text.length === 0) {
                return;
            }
            out.push(text);
            for (let i = 0; i < text.length; i++) {
                const ch = text[i];
                if (ch === '\n') {
                    outputLine++;
                    outputColumn = 1;
                } else {
                    outputColumn++;
                }
            }
        };

        const advanceInput = (ch: string) => {
            if (ch === '\n') {
                inputLine++;
                inputColumn = 1;
            } else if (ch !== '\r') {
                inputColumn++;
            }
        };

        const advanceInputPair = (first: string, second: string) => {
            advanceInput(first);
            advanceInput(second);
        };

        const advanceInputRange = (start: number, end: number) => {
            for (let i = start; i < end; i++) {
                advanceInput(source[i]);
            }
        };

        const consumeLineComment = (): boolean => {
            if (!inLineComment) return false;
            const current = source[index];
            if (current === '\n') {
                append(collapseNewlines ? ' ' : '\n');
                inLineComment = false;
                advanceInput(current);
                index++;
                return true;
            }
            if (!collapseNewlines) {
                append(current);
            }
            advanceInput(current);
            index++;
            return true;
        };

        const consumeBlockComment = (): boolean => {
            if (!inBlockComment) return false;
            const current = source[index];
            const next = source[index + 1];
            if (current === '*' && next === '/') {
                append('*/');
                advanceInputPair(current, next);
                index += 2;
                inBlockComment = false;
                return true;
            }
            if (current === '\n') {
                append(collapseNewlines ? ' ' : '\n');
                advanceInput(current);
                index++;
                return true;
            }
            append(current);
            advanceInput(current);
            index++;
            return true;
        };

        const consumeStringLiteral = (): boolean => {
            if (!inString) return false;
            const current = source[index];
            if (inStringExpr) {
                if (current === '>') {
                    inStringExpr = false;
                }
                append(current);
                advanceInput(current);
                index++;
                return true;
            }
            if (current === '<') {
                inStringExpr = true;
                append(current);
                advanceInput(current);
                index++;
                return true;
            }
            if (current === '\n') {
                append(collapseNewlines ? ' ' : '\n');
                advanceInput(current);
                index++;
                return true;
            }
            append(current);
            if (current === '\\' && index + 1 < sourceLength) {
                append(source[index + 1]);
                advanceInputPair(current, source[index + 1]);
                index += 2;
                return true;
            }
            if (current === '"') {
                inString = false;
            }
            advanceInput(current);
            index++;
            return true;
        };

        const consumeCharLiteral = (): boolean => {
            if (!inChar) return false;
            const current = source[index];
            if (current === '\n') {
                append(collapseNewlines ? ' ' : '\n');
                advanceInput(current);
                index++;
                return true;
            }
            append(current);
            if (current === '\\' && index + 1 < sourceLength) {
                append(source[index + 1]);
                advanceInputPair(current, source[index + 1]);
                index += 2;
                return true;
            }
            if (current === '\'') {
                inChar = false;
            }
            advanceInput(current);
            index++;
            return true;
        };

        while (index < sourceLength) {
            if (consumeLineComment() || consumeBlockComment() || consumeStringLiteral() || consumeCharLiteral()) {
                continue;
            }

            const current = source[index];
            const next = source[index + 1];

            if (current === '/' && next === '/') {
                if (!collapseNewlines) {
                    append('//');
                }
                advanceInputPair(current, next);
                index += 2;
                inLineComment = true;
                continue;
            }

            if (current === '/' && next === '*') {
                append('/*');
                advanceInputPair(current, next);
                index += 2;
                inBlockComment = true;
                continue;
            }

            if (current === '"') {
                inString = true;
                append(current);
                advanceInput(current);
                index++;
                continue;
            }

            if (current === '\'') {
                inChar = true;
                append(current);
                advanceInput(current);
                index++;
                continue;
            }

            if (current === '\r' && next === '\n') {
                advanceInput(current);
                index++;
                continue;
            }

            if (current === '\n') {
                append(collapseNewlines ? ' ' : '\n');
                advanceInput(current);
                index++;
                continue;
            }

            if (current === '#') {
                const callSiteLine = inputLine;
                const callSiteColumn = inputColumn;
                const reportAtCallSite = (message: string) => {
                    this.report(diagnostics, sourceName, callSiteLine, callSiteColumn, message);
                };
                const macroName = this.readIdentifier(source, index + 1);
                if (!macroName) {
                    append(current);
                    advanceInput(current);
                    index++;
                    continue;
                }

                const macro = registry.macros.get(macroName);
                if (!macro) {
                    reportAtCallSite(`Macro '${macroName}' is not defined.`);
                    append(`#${macroName}`);
                    advanceInputRange(index, index + macroName.length + 1);
                    index += macroName.length + 1;
                    continue;
                }

                if (stack.includes(macroName)) {
                    reportAtCallSite(`Macro expansion is cyclic: ${[...stack, macroName].join(' -> ')}`);
                    append(`#${macroName}`);
                    advanceInputRange(index, index + macroName.length + 1);
                    index += macroName.length + 1;
                    continue;
                }

                const afterNameIndex = index + macroName.length + 1;
                let scanIndex = this.skipInlineWhitespace(source, afterNameIndex);
                let callArgs: string[] = [];
                let callEndIndex = afterNameIndex;
                let hasCallArgs = false;

                if (scanIndex < sourceLength && source[scanIndex] === '(') {
                    const parsed = this.parseCallArguments(source, scanIndex);
                    if (!parsed) {
                        reportAtCallSite(`Macro '${macroName}' is missing a closing ')'.`);
                        const fallbackEnd = Math.min(sourceLength, scanIndex + 1);
                        append(source.slice(index, fallbackEnd));
                        advanceInputRange(index, fallbackEnd);
                        index = fallbackEnd;
                        continue;
                    }
                    hasCallArgs = true;
                    callArgs = parsed.args;
                    callEndIndex = parsed.endIndex;
                }

                if (macro.args.length > 0 && !hasCallArgs) {
                    reportAtCallSite(`Macro '${macroName}' requires ${macro.args.length} argument(s).`);
                    append(source.slice(index, callEndIndex));
                    advanceInputRange(index, callEndIndex);
                    index = callEndIndex;
                    continue;
                }

                if (macro.args.length === 0 && hasCallArgs) {
                    reportAtCallSite(`Macro '${macroName}' does not take arguments.`);
                    append(source.slice(index, callEndIndex));
                    advanceInputRange(index, callEndIndex);
                    index = callEndIndex;
                    continue;
                }

                const argValues = macro.args.length > 0 ? callArgs.slice(0, macro.args.length) : [];
                while (argValues.length < macro.args.length) {
                    argValues.push('');
                }

                if (macro.args.length > 0 && callArgs.length !== macro.args.length) {
                    reportAtCallSite(`Macro '${macroName}' expects ${macro.args.length} argument(s) but got ${callArgs.length}.`);
                }

                const semicolonIndex = this.skipInlineWhitespace(source, callEndIndex);
                if (semicolonIndex < sourceLength && source[semicolonIndex] === ';') {
                    callEndIndex = semicolonIndex + 1;
                }

                const substitutedBody = this.applyArgs(macro.body, macro.args, argValues);
                const expandedResult = this.expandSourceInternal(substitutedBody, registry, diagnostics, macro.file, [...stack, macroName], true);
                const expandedBody = expandedResult.text;

                const startLine = outputLine;
                const startColumn = outputColumn;

                if (expandedBody.length > 0) {
                    append(expandedBody);
                }

                const endLine = outputLine;
                const endColumn = Math.max(startColumn, outputColumn - 1);

                spans.push({
                    startLine,
                    startColumn,
                    endLine,
                    endColumn,
                    callSiteLine,
                    callSiteColumn,
                    argValues,
                    macroName,
                    macroFile: macro.file,
                    macroLine: macro.line
                });

                advanceInputRange(index, callEndIndex);
                index = callEndIndex;
                continue;
            }

            append(current);
            advanceInput(current);
            index++;
        }

        return { text: out.join(''), spans };
    }

    private static readIdentifier(source: string, start: number): string | null {
        if (start >= source.length) return null;
        let index = start;
        if (!this.isIdentifierChar(source[index])) return null;
        while (index < source.length && this.isIdentifierChar(source[index])) {
            index++;
        }
        return source.slice(start, index);
    }

    private static skipInlineWhitespace(source: string, start: number): number {
        let index = start;
        while (index < source.length) {
            const ch = source[index];
            if (ch === ' ' || ch === '\t' || ch === '\r' || ch === '\n') {
                index++;
                continue;
            }
            break;
        }
        return index;
    }

    private static parseCallArguments(source: string, startIndex: number): { args: string[]; endIndex: number } | null {
        let index = startIndex;
        const sourceLength = source.length;
        if (source[index] !== '(') return null;
        index++;
        let depth = 1;
        let current = '';
        const args: string[] = [];
        let inString = false;
        let inChar = false;
        while (index < sourceLength) {
            const ch = source[index];
            const next = source[index + 1];

            if (inString) {
                current += ch;
                if (ch === '\\' && next !== undefined) {
                    current += next;
                    index += 2;
                    continue;
                }
                if (ch === '"') {
                    inString = false;
                }
                index++;
                continue;
            }

            if (inChar) {
                current += ch;
                if (ch === '\\' && next !== undefined) {
                    current += next;
                    index += 2;
                    continue;
                }
                if (ch === '\'') {
                    inChar = false;
                }
                index++;
                continue;
            }

            if (ch === '"') {
                inString = true;
                current += ch;
                index++;
                continue;
            }

            if (ch === '\'') {
                inChar = true;
                current += ch;
                index++;
                continue;
            }

            if (ch === '(') {
                depth++;
                current += ch;
                index++;
                continue;
            }

            if (ch === '/' && next === '/') {
                // Skip line comments inside macro argument lists.
                index += 2;
                while (index < sourceLength && source[index] !== '\n') {
                    index++;
                }
                continue;
            }

            if (ch === '/' && next === '*') {
                // Skip block comments inside macro argument lists.
                index += 2;
                while (index < sourceLength) {
                    if (source[index] === '*' && source[index + 1] === '/') {
                        index += 2;
                        break;
                    }
                    index++;
                }
                continue;
            }

            if (ch === ')') {
                depth--;
                if (depth === 0) {
                    const trimmed = current.trim();
                    if (trimmed.length > 0 || args.length > 0) {
                        args.push(trimmed);
                    }
                    return { args, endIndex: index + 1 };
                }
                current += ch;
                index++;
                continue;
            }

            if (ch === ',' && depth === 1) {
                args.push(current.trim());
                current = '';
                index++;
                continue;
            }

            current += ch;
            index++;
        }

        return null;
    }

    public static applyArgs(body: string, argNames: string[], argValues: string[]): string {
        if (argNames.length === 0) {
            return body;
        }
        const bodyLength = body.length;
        const args = new Map<string, string>();
        for (let i = 0; i < argNames.length; i++) {
            args.set(argNames[i], argValues[i] ?? '');
        }

        const out: string[] = [];
        let index = 0;
        let inLineComment = false;
        let inBlockComment = false;
        let inString = false;
        let inStringExpr = false;
        let inChar = false;

        const push = (text: string) => {
            if (text.length > 0) {
                out.push(text);
            }
        };

        const consumeLineComment = (): boolean => {
            if (!inLineComment) return false;
            const current = body[index];
            push(current);
            if (current === '\n') {
                inLineComment = false;
            }
            index++;
            return true;
        };

        const consumeBlockComment = (): boolean => {
            if (!inBlockComment) return false;
            const current = body[index];
            const next = body[index + 1];
            if (current === '*' && next === '/') {
                push('*/');
                index += 2;
                inBlockComment = false;
                return true;
            }
            push(current);
            index++;
            return true;
        };

        const consumeStringLiteral = (): boolean => {
            if (!inString) return false;
            const current = body[index];
            if (inStringExpr) {
                push(current);
                if (current === '>') {
                    inStringExpr = false;
                }
                index++;
                return true;
            }
            if (current === '<') {
                inStringExpr = true;
                push(current);
                index++;
                return true;
            }
            push(current);
            if (current === '\\' && index + 1 < bodyLength) {
                push(body[index + 1]);
                index += 2;
                return true;
            }
            if (current === '"') {
                inString = false;
            }
            index++;
            return true;
        };

        const consumeCharLiteral = (): boolean => {
            if (!inChar) return false;
            const current = body[index];
            push(current);
            if (current === '\\' && index + 1 < bodyLength) {
                push(body[index + 1]);
                index += 2;
                return true;
            }
            if (current === '\'') {
                inChar = false;
            }
            index++;
            return true;
        };

        while (index < bodyLength) {
            if (consumeLineComment() || consumeBlockComment() || consumeStringLiteral() || consumeCharLiteral()) {
                continue;
            }

            const current = body[index];
            const next = body[index + 1];

            if (current === '/' && next === '/') {
                push('//');
                index += 2;
                inLineComment = true;
                continue;
            }

            if (current === '/' && next === '*') {
                push('/*');
                index += 2;
                inBlockComment = true;
                continue;
            }

            if (current === '"') {
                inString = true;
                push(current);
                index++;
                continue;
            }

            if (current === '\'') {
                inChar = true;
                push(current);
                index++;
                continue;
            }

            if (this.isIdentifierChar(current)) {
                const ident = this.readIdentifier(body, index) ?? current;
                if (args.has(ident)) {
                    push(args.get(ident) ?? '');
                } else {
                    push(ident);
                }
                index += ident.length;
                continue;
            }

            push(current);
            index++;
        }

        return out.join('');
    }

    public static mapFlatIndexToLineCol(body: string, flatIndex: number): { line: number; column: number } | null {
        if (flatIndex < 0) return null;
        let line = 1;
        let column = 1;
        let index = 0;

        for (let i = 0; i < body.length; i++) {
            const ch = body[i];
            const next = body[i + 1];

            if (ch === '\r' && next === '\n') {
                if (index === flatIndex) {
                    return { line, column };
                }
                index++;
                line++;
                column = 1;
                i++;
                continue;
            }

            if (ch === '\n') {
                if (index === flatIndex) {
                    return { line, column };
                }
                index++;
                line++;
                column = 1;
                continue;
            }

            if (index === flatIndex) {
                return { line, column };
            }

            index++;
            column++;
        }

        if (index === flatIndex) {
            return { line, column };
        }

        return null;
    }

    private static isIdentifierChar(ch: string): boolean {
        const code = ch.charCodeAt(0);
        return (
            (code >= 48 && code <= 57) || // 0-9
            (code >= 65 && code <= 90) || // A-Z
            (code >= 97 && code <= 122) || // a-z
            code === 95 || // _
            code === 43 || // +
            code === 46 || // .
            code === 58 // :
        );
    }

    private static stripLineComment(line: string): string {
        let inString = false;
        let inChar = false;
        for (let i = 0; i < line.length - 1; i++) {
            const current = line[i];
            const next = line[i + 1];

            if (current === '\\') {
                i++;
                continue;
            }

            if (inString) {
                if (current === '"') inString = false;
                continue;
            }
            if (inChar) {
                if (current === '\'') inChar = false;
                continue;
            }

            if (current === '"') {
                inString = true;
                continue;
            }

            if (current === '\'') {
                inChar = true;
                continue;
            }

            if (current === '/' && next === '/') {
                return line.slice(0, i).trimEnd();
            }
        }
        return line.trimEnd();
    }

    private static report(diagnostics: Diagnostics, file: string, line: number, column: number, message: string): void {
        const source: NodeSourceLocation = {
            name: file,
            line,
            column,
            endLine: line,
            endColumn: column
        };
        diagnostics.report(new Diagnostic(DiagnosticType.ERROR, source, message));
    }
}
