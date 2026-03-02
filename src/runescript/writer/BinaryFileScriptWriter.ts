import fs from 'fs';
import path from 'path';

import { RuneScript } from '#/compiler/codegen/script/RuneScript.js';

import { IdProvider } from '#/compiler/writer/BaseScriptWriter.js';
import { BinaryScriptWriter } from '#/runescript/writer/BinaryScriptWriter.js';

/**
 * An implementation of [BinaryScriptWriter] that writes the scripts to [output].
 */
export class BinaryFileScriptWriter extends BinaryScriptWriter {
    private readonly output: string;

    constructor(output: string, idProvider: IdProvider) {
        super(idProvider);
        this.output = output;
        if (!fs.existsSync(output)) {
            fs.mkdirSync(output, { recursive: true });
        }

        if (!fs.statSync(output).isDirectory()) {
            throw new Error(`${path.resolve(output)} is not a directory.`);
        }
    }

    override outputScript(script: RuneScript, data: Buffer): void {
        const id = this.idProvider.get(script.symbol);
        const scriptPath = path.join(this.output, String(id));

        fs.writeFileSync(scriptPath, data);
    }
}
