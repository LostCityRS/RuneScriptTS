import { readFileSync } from 'fs';
import { readFile } from 'fs/promises';
import { CharStream, CharStreams, CommonTokenStream } from 'antlr4ts';
import { ANTLRErrorListener } from 'antlr4ts/ANTLRErrorListener';
import { ParserRuleContext } from 'antlr4ts/ParserRuleContext';
import { ScriptFile } from '../ast/ScriptFile';
import { RuneScriptLexer } from '../../antlr/RuneScriptLexer';
import { Node } from '../ast/Node';
import { Script } from '../ast/Scripts';
import { AstBuilder } from './AstBuilder';
import { RuneScriptParser } from '../../antlr/RuneScriptParser';

export class ScriptParser {
  public static createScriptFile(
    inputPath: string,
    errorListener?: ANTLRErrorListener<any>
  ): ScriptFile | null {
    const source = readFileSync(inputPath, "utf8");
    return this.invokeParser(
      CharStreams.fromString(source, inputPath),
      parser => parser.scriptFile(),
      errorListener
    ) as ScriptFile | null;
  }

  public static async createScriptFileAsync(
    inputPath: string,
    errorListener?: ANTLRErrorListener<any>
  ): Promise<ScriptFile | null> {
    const source = await readFile(inputPath, "utf8");
    return this.invokeParser(
      CharStreams.fromString(source, inputPath),
      (parser) => parser.scriptFile(),
      errorListener
    ) as ScriptFile | null;
  }

  public static createScriptFileFromString(
    scriptFile: string,
    errorListener?: ANTLRErrorListener<any>
  ): ScriptFile | null {
    return this.invokeParser(
      CharStreams.fromString(scriptFile, "<source>"),
      parser => parser.scriptFile(),
      errorListener
    ) as ScriptFile | null;
  }

  public static createScript(
    script: string,
    errorListener?: ANTLRErrorListener<any>
  ): Script | null {
    return this.invokeParser(
      CharStreams.fromString(script, "<source>"),
      parser => parser.script(),
      errorListener
    ) as Script | null;
  }

  public static invokeParser(
    stream: CharStream,
    entry: (parser: RuneScriptParser) => ParserRuleContext,
    errorListener?: ANTLRErrorListener<any>,
    lineOffset = 0,
    columnOffset = 0
  ): Node | null {
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

    return new AstBuilder(stream.sourceName, lineOffset, columnOffset).visit(tree);
  }
}