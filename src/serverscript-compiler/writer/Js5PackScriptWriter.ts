import * as fs from 'fs';
import * as path from 'path';
import * as zlib from 'zlib';
import { IdProvider } from "../../runescript-compiler/writer/BaseScriptWriter";
import { BinaryScriptWriter } from "./BinaryScriptWriter";
import { RuneScript } from '../../runescript-compiler/codegen/script/RuneScript';
import { ByteWriter, crc32 } from './BytePacket';

/**
 * A [BinaryScriptWriter] implementation that writes scripts into a complete
 * sequential `.js5` archive.
 *
 * File layout:
 * - packed JS5 index group
 * - packed group data for each group id in index order
 * - trailing 4-byte group lengths table
 */
export class Js5PackScriptWriter extends BinaryScriptWriter {
    private readonly output: string;
    private readonly buffers = new Map<number, Buffer>();

    private static readonly INDEX_FORMAT = 7;
    private static readonly INDEX_VERSION = 1;
    private static readonly GROUP_VERSION = 1;

    constructor(output: string, idProvider: IdProvider) {
        super(idProvider);
        this.output = output;

        const outputDir = path.dirname(output);
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        if (!fs.statSync(outputDir).isDirectory()) {
            throw new Error(`${path.resolve(outputDir)} is not a directory.`);
        }
    }

    override outputScript(script: RuneScript, data: Buffer): void {
        const id = this.idProvider.get(script.symbol);

        // Mimic retain() semantics by keeping an owned copy.
        this.buffers.set(id, Buffer.from(data));
    }

    override close(): void {
        const groups = [...this.buffers.entries()]
            .sort((a, b) => a[0] - b[0])
            .map(([groupId, scriptData]) => {
                const packedGroup = this.packGroup(scriptData, 0);
                return {
                    groupId,
                    packedGroup,
                    checksum: crc32(packedGroup),
                    version: Js5PackScriptWriter.GROUP_VERSION,
                };
            });

        const indexData = this.encodeIndex(groups);
        const packedIndex = this.packGroup(indexData, 2);
        const js5 = fs.openSync(this.output, 'w');

        try {
            fs.writeSync(js5, packedIndex);

            for (const group of groups) {
                fs.writeSync(js5, group.packedGroup);
            }

            for (const group of groups) {
                this.p4(js5, group.packedGroup.length);
            }
        } finally {
            fs.closeSync(js5);
        }
    }

    private encodeIndex(groups: { groupId: number; checksum: number; version: number; }[]): Buffer {
        const writer = new ByteWriter(128);

        writer.p1(Js5PackScriptWriter.INDEX_FORMAT);
        writer.p4(Js5PackScriptWriter.INDEX_VERSION);

        // flags: no names, no digests, no lengths, no uncompressed checksums.
        writer.p1(0);

        writer.pSmart2or4(groups.length);

        let previousGroupId = 0;
        for (const group of groups) {
            writer.pSmart2or4(group.groupId - previousGroupId);
            previousGroupId = group.groupId;
        }

        for (const group of groups) {
            writer.p4(group.checksum);
        }

        for (const group of groups) {
            writer.p4(group.version);
        }

        for (const _group of groups) {
            // One file per group.
            writer.pSmart2or4(1);
        }

        for (const _group of groups) {
            // Single file id (0), delta encoded.
            writer.pSmart2or4(0);
        }

        return writer.toBuffer();
    }

    private packGroup(src: Buffer, compression: number): Buffer {
        const writer = new ByteWriter(src.length + 16);

        writer.p1(compression);

        if (compression === CompressionType.NONE) {
            writer.p4(src.length);
            writer.pdata(src);
        } else if (compression === CompressionType.GZIP) {
            const compressed = zlib.gzipSync(src);
            compressed[9] = 0;

            writer.p4(compressed.length);
            writer.p4(src.length);
            writer.pdata(compressed);
        } else {
            throw new Error(`Unsupported compression type ${compression}`);
        }

        return writer.toBuffer();
    }

    private p4(fd: number, num: number): void {
        const buf = Buffer.allocUnsafe(4);
        buf.writeInt32BE(num, 0);
        fs.writeSync(fd, buf);
    }
}

export const enum CompressionType {
    NONE,
    BZIP2,
    GZIP
}