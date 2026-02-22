import { readFileSync } from 'fs';
import { readFile } from 'fs/promises';

import { CharStream, CommonTokenStream, ANTLRErrorListener, ParserRuleContext } from 'antlr4ng';

import { RuneScriptLexer } from '#/antlr/RuneScriptLexer.js';
import { RuneScriptParser } from '#/antlr/RuneScriptParser.js';

import { Node } from '#/runescript-parser/ast/Node.js';
import { ScriptFile } from '#/runescript-parser/ast/ScriptFile.js';
import { Script } from '#/runescript-parser/ast/Scripts.js';
import { AstBuilder } from '#/runescript-parser/parser/AstBuilder.js';

export class ScriptParser {
    public static createScriptFile(inputPath: string, errorListener?: ANTLRErrorListener): ScriptFile | null {
        const source = readFileSync(inputPath, 'utf8');
        const stream = CharStream.fromString(source);
        stream.name = inputPath;
        return this.invokeParser(stream, parser => parser.scriptFile(), errorListener) as ScriptFile | null;
    }

    public static async createScriptFileAsync(inputPath: string, errorListener?: ANTLRErrorListener): Promise<ScriptFile | null> {
        const source = await readFile(inputPath, 'utf8');
        const stream = CharStream.fromString(source);
        stream.name = inputPath;
        return this.invokeParser(stream, parser => parser.scriptFile(), errorListener) as ScriptFile | null;
    }

    public static createScriptFileFromString(scriptFile: string, errorListener?: ANTLRErrorListener): ScriptFile | null {
        const stream = CharStream.fromString(scriptFile);
        stream.name = '<source>';
        return this.invokeParser(stream, parser => parser.scriptFile(), errorListener) as ScriptFile | null;
    }

    public static createScript(script: string, errorListener?: ANTLRErrorListener): Script | null {
        const stream = CharStream.fromString(script);
        stream.name = '<source>';
        return this.invokeParser(stream, parser => parser.script(), errorListener) as Script | null;
    }

    public static invokeParser(stream: CharStream, entry: (parser: RuneScriptParser) => ParserRuleContext, errorListener?: ANTLRErrorListener, lineOffset = 0, columnOffset = 0): Node | null {
        const lexer = new RuneScriptLexer(stream);
        const tokens = new CommonTokenStream(lexer);
        const parser = new RuneScriptParser(tokens);

        // Setup error listeners
        if (errorListener) {
            lexer.removeErrorListeners();
            lexer.addErrorListener(errorListener);

            parser.removeErrorListeners();
            parser.addErrorListener(errorListener);
        }

        const tree = entry(parser);

        // If there were any errors detected, return null for the whole node
        if (parser.numberOfSyntaxErrors > 0) {
            return null;
        }

        return new AstBuilder(stream.getSourceName(), lineOffset, columnOffset).visit(tree);
    }
}
