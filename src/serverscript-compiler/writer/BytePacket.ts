/**
 * Shared byte packing/unpacking utilities for JS5 archive operations.
 */

const CRC_TABLE = (() => {
    const table = new Int32Array(256);

    for (let b = 0; b < 256; b++) {
        let remainder = b;

        for (let bit = 0; bit < 8; bit++) {
            if ((remainder & 1) === 1) {
                remainder = (remainder >>> 1) ^ 0xEDB88320;
            } else {
                remainder >>>= 1;
            }
        }

        table[b] = remainder;
    }

    return table;
})();

export function crc32(data: Buffer): number {
    let crc = 0xffffffff;
    for (let i = 0; i < data.length; i++) {
        crc = (crc >>> 8) ^ (CRC_TABLE[(crc ^ data[i]) & 0xff]);
    }
    return (~crc) | 0;
}

export class ByteWriter {
    private buffer: Buffer;
    private offset = 0;

    constructor(initialSize: number) {
        this.buffer = Buffer.alloc(Math.max(64, initialSize));
    }

    p1(value: number): void {
        this.ensure(1);
        this.buffer.writeUInt8(value & 0xff, this.offset);
        this.offset += 1;
    }

    p2(value: number): void {
        this.ensure(2);
        this.buffer.writeUInt16BE(value & 0xffff, this.offset);
        this.offset += 2;
    }

    p4(value: number): void {
        this.ensure(4);
        this.buffer.writeInt32BE(value | 0, this.offset);
        this.offset += 4;
    }

    pSmart2or4(value: number): void {
        if (value < 32768) {
            this.p2(value);
        } else {
            this.p4(value | 0x80000000);
        }
    }

    pdata(data: Buffer): void {
        this.ensure(data.length);
        data.copy(this.buffer, this.offset);
        this.offset += data.length;
    }

    toBuffer(): Buffer {
        return this.buffer.subarray(0, this.offset);
    }

    private ensure(extra: number): void {
        if (this.offset + extra <= this.buffer.length) {
            return;
        }

        let nextSize = this.buffer.length * 2;
        while (this.offset + extra > nextSize) {
            nextSize *= 2;
        }

        const next = Buffer.alloc(nextSize);
        this.buffer.copy(next, 0, 0, this.offset);
        this.buffer = next;
    }
}
