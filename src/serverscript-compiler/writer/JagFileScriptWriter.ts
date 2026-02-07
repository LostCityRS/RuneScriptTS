import * as fs from 'fs';
import * as path from 'path';
import { IdProvider } from "../../runescript-compiler/writer/BaseScriptWriter";
import { BinaryScriptWriter } from "./BinaryScriptWriter";
import { RuneScript } from '../../runescript-compiler/codegen/script/RuneScript';

/**
 * A [BinaryFileScriptWriter] implementation that writes to `script.dat` and `script.idx`.
 */
export class JagFileScriptWriter extends BinaryScriptWriter {
    
    private readonly output: string;
    private readonly buffers = new Map<number, Buffer>();

    private static readonly VERSION = 26;

    constructor(output: string, idProvider: IdProvider) {
        super(idProvider);
        this.output = output;

        if (!fs.existsSync(output)) {
            fs.mkdirSync(output, { recursive: true});
        }

        if (!fs.statSync(output).isDirectory()) {
            throw new Error(`${path.resolve(output)} is not a directory.`);
        }
    }

    override outputScript(script: RuneScript, data: Buffer): void {
        const id = this.idProvider.get(script.symbol);

        // Mimic Netty's retain() - store a copy.
        this.buffers.set(id, Buffer.from(data));
    }

    override close(): void {
        const datPath = path.join(this.output, 'script.dat');
        const idxPath = path.join(this.output, 'script.idx');
        
        const dat = fs.openSync(datPath, 'w');
        const idx = fs.openSync(idxPath, 'w');

        try {
            const keys = [...this.buffers.keys()].sort((a, b) => a - b);
            const lastId = keys.length > 0 ? keys[keys.length - 1] : 0;

            // Write number of entries (including gaps).
            this.p4(dat, lastId + 1);
            this.p4(idx, lastId + 1);

            // Write version to '.dat'.
            this.p4(dat, JagFileScriptWriter.VERSION);
            for (let i = 0; i <= lastId; i++) {
                const buffer = this.buffers.get(i);
                if (!buffer) {
                    // Gap, no size.
                    this.p4(idx, 0);
                    continue;
                }

                // Write the data to '.dat', and size to '.idx'.
                this.p4(idx, buffer.length);
                fs.writeSync(dat, buffer);
            }
        } finally {
            fs.closeSync(dat);
            fs.closeSync(idx);
        }
    }

    private p2(fd: number, num: number): void {
        const buf = Buffer.allocUnsafe(2);
        buf.writeUInt16BE(num & 0xffff, 0);
        fs.writeSync(fd, buf);
    }

    private p4(fd: number, num: number): void {
        const buf = Buffer.allocUnsafe(4);
        buf.writeInt32BE(num, 0);
        fs.writeSync(fd, buf);
    }
}