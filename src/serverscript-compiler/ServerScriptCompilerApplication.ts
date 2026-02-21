import { existsSync, readFileSync } from 'fs';
import { join, resolve } from 'path';
import { exit } from 'process';
import { PointerType } from '../runescript-compiler/pointer/PointerType';
import { SymbolMapper } from './SymbolMapper';
import { JagFileScriptWriter } from './writer/JagFileScriptWriter';
import { PointerHolder } from '../runescript-compiler/pointer/PointerHolder';
import { ServerScriptCompiler } from './ServerScriptCompiler';
import * as console from 'console';
import { ScriptWriter } from '../runescript-compiler/writer/ScriptWriter';
import { Js5PackScriptWriter } from './writer/Js5PackScriptWriter';


export function CompileServerScript(config?: {
    sourcePaths: string[] | undefined,
    symbolPaths: string[] | undefined,
    excludePaths: string[] | undefined,
    checkPointers: boolean | undefined;
    writer: {
        jag: {
            output: string
        } | undefined,
        js5: {
            output: string
        } | undefined
    }
}) {
    // default config
    let sourcePaths: string[] = ['../content/scripts'];
    let symbolPaths: string[] = ['./data/symbols'];
    let excludePaths: string[] = [];
    let checkPointers: boolean = true;

    let jagWriterConfig = { output: './data/pack/server' };
    let js5WriterConfig = null;

    // override with user settings
    if (typeof config !== 'undefined') {
        if (typeof config.sourcePaths !== 'undefined') {
            sourcePaths = config.sourcePaths;
        }

        if (typeof config.symbolPaths !== 'undefined') {
            symbolPaths = config.symbolPaths;
        }

        if (typeof config.excludePaths !== 'undefined') {
            excludePaths = config.excludePaths;
        }

        if (typeof config.checkPointers !== 'undefined') {
            checkPointers = config.checkPointers;
        }

        if (typeof config.writer !== 'undefined') {
            if (typeof config.writer.jag !== 'undefined') {
                jagWriterConfig = config.writer.jag;
                js5WriterConfig = null;
            } else if (typeof config.writer.js5 !== 'undefined') {
                js5WriterConfig = config.writer.js5;
                jagWriterConfig = null;
            }
        }
    }

    sourcePaths.map(p => resolve(p));
    symbolPaths.map(p => resolve(p));
    excludePaths.map(p => resolve(p));
    
    const mapper = new SymbolMapper();
    let writer: ScriptWriter;

    if (jagWriterConfig) {
        writer = new JagFileScriptWriter(resolve(jagWriterConfig.output), mapper);
    } else if (js5WriterConfig) {
        writer = new Js5PackScriptWriter(resolve(js5WriterConfig.output), mapper);
    } else {
        console.error(`No writer configured.`);
        exit(1);
    }

    const commandPointers = new Map<string, PointerHolder>();
    loadSpecialSymbols(symbolPaths, mapper, commandPointers, checkPointers);

    const compiler = new ServerScriptCompiler(sourcePaths, excludePaths, writer, commandPointers, symbolPaths, mapper);
    compiler.setup();
    compiler.run('rs2');

}

function loadSpecialSymbols(symbolPaths: string[], mapper: SymbolMapper, commandPointers: Map<string, PointerHolder>, checkPointers: boolean) {
    for (const symbolPath of symbolPaths) {
        const commandsFile = join(symbolPath, 'commands.sym');
        if (existsSync(commandsFile)) {
            const lines = readFileSync(commandsFile, 'utf-8').split(/\r?\n/);
            for (const line of lines) {
                if (!line.trim()) continue;
                const split = line.split('\t');
                const id = parseInt(split[0], 10);
                const name = split[1];

                if (checkPointers && split.length > 2) {
                    const requiredText = split[2] ?? '';
                    const setTextTemp = split[3] ?? '';
                    const setText = setTextTemp.includes('CONDITIONAL:') ? setTextTemp.split('CONDITIONAL:')[1] : setTextTemp;
                    const corruptedText = split[4] ?? '';

                    const [req1, req2] = requiredText.split(':');
                    const [set1, set2] = setText.split(':');
                    const [cor1, cor2] = corruptedText.split(':');

                    const required = parsePointerList(req1);
                    const required2 = parsePointerList(req2);
                    const setter = parsePointerList(set1);
                    const setter2 = parsePointerList(set2);
                    const conditionalSet = setTextTemp !== setText;
                    const corrupted = parsePointerList(cor1);
                    const corrupted2 = parsePointerList(cor2);

                    commandPointers.set(name, { required, set: setter, conditionalSet, corrupted} as PointerHolder);
                    if (required2.size || setter2.size || corrupted2.size) {
                        commandPointers.set(`.${name}`, { required: required2, set: setter2, conditionalSet, corrupted: corrupted2 })
                    }
                }
                //console.log(`Command added: ${id}, '${name}'.`);
                mapper.putCommand(id, name);
            }
        }

        // Load pre-existing script ID mappings
        const scriptMappings = join(symbolPath, 'runescript.sym');
        if (existsSync(scriptMappings)) {
            const lines = readFileSync(scriptMappings, 'utf-8').split(/\r?\n/);
            for (const line of lines) {
                if (!line.trim()) continue;
                const split = line.split('\t');
                const id = parseInt(split[0], 10);
                const name = split[1];
                //console.log(`Script mapping: ${id}, '${name}'.`);
                mapper.putScript(id, name);
            }
        }
    }
}

function parsePointerList(text?: string): Set<PointerType> {
    if (!text ||text === 'none') return new Set();
    const pointers = new Set<PointerType>();
    const names = text.split(',');
    for (const name of names) {
        const ptr = PointerType.forName(name);
        if (ptr) pointers.add(ptr);
        else throw new Error(`Invalid pointer name: ${name}.`);
    }
    return pointers;
}
