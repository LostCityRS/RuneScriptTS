import { existsSync, readFileSync } from 'fs';
import { join, resolve } from 'path';
import { parse } from '@iarna/toml';
import { exit } from 'process';
import { ServerScriptCompilerConfig } from './configuration/ServerScriptCompilerconfig';
import { PointerType } from '../runescript-compiler/pointer/PointerType';
import { SymbolMapper } from './SymbolMapper';
import { JagFileScriptWriter } from './writer/JagFileScriptWriter';
import { PointerHolder } from '../runescript-compiler/pointer/PointerHolder';
import { ServerScriptCompiler } from './ServerScriptCompiler';
import * as console from 'console';


export function main(args: string[]) {
    const configPath = args.length > 0 ? resolve(args[0]) : resolve('neptune.toml');
    const config = loadConfig(configPath);

    const sourcePaths = config.sourcePaths.map(p => resolve(p));
    const symbolPaths = config.symbolPaths.map(p => resolve(p));
    const excludePaths = config.excludePaths.map(p => resolve(p));
    const checkPointers = config.checkPointers;

    const { binary: binaryWriterConfig} = config.writers;
    
    const mapper = new SymbolMapper();
    let writer: JagFileScriptWriter;

    if (binaryWriterConfig) {
        writer = new JagFileScriptWriter(resolve(binaryWriterConfig.output), mapper);
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

function loadConfig(configPath: string) : ServerScriptCompilerConfig {
    if (!existsSync(configPath)) {
        console.error(`Unable to locate configuration file: ${configPath}.`);
        exit(1);
    }

    const tomlText = readFileSync(configPath, 'utf-8');
    const rawConfig = parse(tomlText) as any;

    // Map fields if needed.
    const config: ServerScriptCompilerConfig = {
        sourcePaths: rawConfig.sources ?? [],
        symbolPaths: rawConfig.symbols ?? [],
        excludePaths: rawConfig.excluded ?? [],
        checkPointers: rawConfig.check_pointers ?? false,
        writers: {
            binary: rawConfig.writer?.binary
        }
    };

    console.debug(`Loading configuration from ${configPath}.`);
    return config;
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
    }
    //throw new Error(`booooom`);
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

if (import.meta.main) {
    main(process.argv.slice(2));
}