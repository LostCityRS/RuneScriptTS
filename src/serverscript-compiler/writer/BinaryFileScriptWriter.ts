import * as fs from 'fs';
import * as path from 'path';
import { IdProvider } from "../../runescript-compiler/writer/BaseScriptWriter";
import { BinaryScriptWriter } from "./BinaryScriptWriter";
import { RuneScript } from '../../runescript-compiler/codegen/script/RuneScript';

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

    outputScript(script: RuneScript, data: Buffer): void {
        const id = this.idProvider.get(script.symbol);
        const scriptPath = path.join(this.output, String(id));

        fs.writeFileSync(scriptPath, data);
    }
}