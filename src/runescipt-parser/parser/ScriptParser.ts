import * as fs from 'fs';
import { CharStreams, CommonTokenStream } from 'antlr4ts';
import { ANTLRErrorListener } from 'antlr4ts/ANTLRErrorListener';
import { ParserRuleContext } from 'antlr4ts/ParserRuleContext';
import { ScriptFile } from '../ast/ScriptFile';
import { RuneScriptParser } from '../../../antlr/out/RuneScriptParser';
import { RuneScriptLexer } from '../../../antlr/out/RuneScriptLexer';
import { Node } from '../ast/Node';
import { Script } from '../ast/Scripts';
import { AstBuilder } from './AstBuilder';

export class ScriptParser {
  static createScriptFile(
    inputPath: string,
    errorListener?: ANTLRErrorListener<any>
  ): ScriptFile | null {
    const source = fs.readFileSync(inputPath, "utf8");
    const normalized = inputPath;

    return this.invokeParser(
      CharStreams.fromString(source, normalized),
      parser => parser.scriptFile(),
      errorListener
    ) as ScriptFile | null;
  }

  static createScriptFileFromString(
    scriptFile: string,
    errorListener?: ANTLRErrorListener<any>
  ): ScriptFile | null {
    return this.invokeParser(
      CharStreams.fromString(scriptFile, "<source>"),
      parser => parser.scriptFile(),
      errorListener
    ) as ScriptFile | null;
  }

  static createScript(
    script: string,
    errorListener?: ANTLRErrorListener<any>
  ): Script | null {
    return this.invokeParser(
      CharStreams.fromString(script, "<source>"),
      parser => parser.script(),
      errorListener
    ) as Script | null;
  }

  static invokeParser(
    stream: ReturnType<typeof CharStreams.fromString>,
    entry: (parser: RuneScriptParser) => ParserRuleContext,
    errorListener?: ANTLRErrorListener<any>,
    lineOffset = 0,
    columnOffset = 0
  ): Node | null {
    const lexer = new RuneScriptLexer(stream);
    const tokens = new CommonTokenStream(lexer);
    const parser = new RuneScriptParser(tokens);

    // setup error listeners
    if (errorListener) {
      lexer.removeErrorListeners();
      lexer.addErrorListener(errorListener);

      parser.removeErrorListeners();
      parser.addErrorListener(errorListener);
    }

    const tree = entry(parser);

    // if there were any errors detected, return null for the whole node
    if (parser.numberOfSyntaxErrors > 0) {
      return null;
    }

    return new AstBuilder(
      stream.sourceName,
      lineOffset,
      columnOffset
    ).visit(tree);
  }
}