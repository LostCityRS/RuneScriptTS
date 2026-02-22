import { resolve } from 'path';
import { PointerType } from '../runescript-compiler/pointer/PointerType';
import { SymbolMapper } from './SymbolMapper';
import { JagFileScriptWriter } from './writer/JagFileScriptWriter';
import { PointerHolder } from '../runescript-compiler/pointer/PointerHolder';
import { ServerScriptCompiler } from './ServerScriptCompiler';
import { ScriptWriter } from '../runescript-compiler/writer/ScriptWriter';
import { Js5PackScriptWriter } from './writer/Js5PackScriptWriter';
import { CompilerTypeInfo } from './CompilerTypeInfo.js';


export function CompileServerScript(config?: {
    sourcePaths?: string[];
    symbols?: Record<string, CompilerTypeInfo>;
    excludePaths?: string[];
    checkPointers?: boolean;
    writer?: {
        jag?: {
            output: string;
        };
        js5?: {
            output: string;
        };
    };
}) {
    if (typeof config.symbols === 'undefined' || typeof config.symbols['command'] === 'undefined' || typeof config.symbols['runescript'] === 'undefined') {
        throw new Error('Core symbols missing from compiler. Please provide command and runescript symbols.');
    }

    // default config
    let sourcePaths: string[] = ['../content/scripts'];
    let excludePaths: string[] = [];
    let checkPointers: boolean = true;

    let jagWriterConfig = { output: './data/pack/server' };
    let js5WriterConfig = null;

    // override with user settings
    if (typeof config !== 'undefined') {
        if (typeof config.sourcePaths !== 'undefined') {
            sourcePaths = config.sourcePaths;
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
    excludePaths.map(p => resolve(p));
    
    const mapper = new SymbolMapper();
    let writer: ScriptWriter;

    if (jagWriterConfig) {
        writer = new JagFileScriptWriter(resolve(jagWriterConfig.output), mapper);
    } else if (js5WriterConfig) {
        writer = new Js5PackScriptWriter(resolve(js5WriterConfig.output), mapper);
    } else {
        throw new Error('No writer configured.');
    }

    const commandPointers = new Map<string, PointerHolder>();
    loadSpecialSymbols(config.symbols['command'], config.symbols['runescript'], mapper, commandPointers, checkPointers);

    const compiler = new ServerScriptCompiler(sourcePaths, excludePaths, writer, commandPointers, config.symbols, mapper);
    compiler.setup();
    compiler.run('rs2');

}

function loadSpecialSymbols(commandInfo: CompilerTypeInfo, scriptInfo: CompilerTypeInfo, mapper: SymbolMapper, commandPointers: Map<string, PointerHolder>, checkPointers: boolean) {
    for (const [key, name] of Object.entries(commandInfo.map)) {
        const id = parseInt(key);

        if (checkPointers && (commandInfo.require[key] || commandInfo.set[key] || commandInfo.corrupt[key])) {
            const required = parsePointerList(commandInfo.require[key]);
            const required2 = parsePointerList(commandInfo.require2[key]);
            const setter = parsePointerList(commandInfo.set[key]);
            const setter2 = parsePointerList(commandInfo.set2[key]);
            const conditionalSet = commandInfo.conditional[key] ?? false;
            const corrupted = parsePointerList(commandInfo.corrupt[key]);
            const corrupted2 = parsePointerList(commandInfo.corrupt2[key]);

            commandPointers.set(name, { required, set: setter, conditionalSet, corrupted} as PointerHolder);

            if (required2.size || setter2.size || corrupted2.size) {
                commandPointers.set(`.${name}`, { required: required2, set: setter2, conditionalSet, corrupted: corrupted2 })
            }
        }

        mapper.putCommand(id, name);
    }

    for (const [key, name] of Object.entries(scriptInfo.map)) {
        const id = parseInt(key);

        mapper.putScript(id, name);
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
