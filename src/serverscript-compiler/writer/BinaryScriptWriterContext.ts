import { RuneScript } from '#/runescript-compiler/codegen/script/RuneScript.js';
import { BaseVarType } from '#/runescript-compiler/type/BaseVarType.js';
import { TupleType } from '#/runescript-compiler/type/TupleType.js';
import { BaseScriptWriter, BaseScriptWriterContext } from '#/runescript-compiler/writer/BaseScriptWriter.js';

import { ServerScriptOpcode } from '#/serverscript-compiler/ServerScriptOpcode.js';
import { ServerTriggerType } from '#/serverscript-compiler/trigger/ServerTriggerType.js';

export class BinaryScriptWriterContext extends BaseScriptWriterContext {
    /**
     * This value was determined by checking the average size of all scripts
     * in OSRS and rounding to the next power of two.
     */
    private static readonly INITIAL_CAPACITY = 512;

    /**
     * The buffer that contains all instruction information.
     */
    private instructionBuffer: Buffer;

    /**
     * The buffer that container all switch table information.
     */
    private switchBuffer: Buffer;

    /**
     * Tracks the number of instructions within the script.
     */
    private instructionCount = 0;

    private instructionOffset = 0;
    private switchOffset = 0;

    constructor(
        script: RuneScript,
        private readonly lookupKey: number
    ) {
        super(script);

        this.instructionBuffer = Buffer.alloc(BinaryScriptWriterContext.INITIAL_CAPACITY);
        this.switchBuffer = Buffer.alloc(BinaryScriptWriterContext.INITIAL_CAPACITY);
    }

    private ensureInstructionCapacity(extra: number): void {
        if (this.instructionOffset + extra > this.instructionBuffer.length) {
            const next = Buffer.alloc(this.instructionBuffer.length * 2);
            this.instructionBuffer.copy(next);
            this.instructionBuffer = next;
        }
    }

    private ensureSwitchCapacity(extra: number): void {
        if (this.switchOffset + extra > this.switchBuffer.length) {
            const next = Buffer.alloc(this.switchBuffer.length * 2);
            this.switchBuffer.copy(next);
            this.switchBuffer = next;
        }
    }

    instruction(opcode: ServerScriptOpcode, operand: number): void {
        this.instructionCount++;

        this.ensureInstructionCapacity(opcode.largeOperand ? 6 : 4);

        this.instructionBuffer.writeUInt16BE(opcode.id, this.instructionOffset);
        this.instructionOffset += 2;

        if (opcode.largeOperand) {
            this.instructionBuffer.writeInt32BE(operand | 0, this.instructionOffset);
            this.instructionOffset += 4;
        } else {
            this.instructionBuffer.writeUInt8(operand, this.instructionOffset);
            this.instructionOffset += 1;
        }
    }

    instructionRaw(opcode: number, operand: number): void {
        this.instructionCount++;

        this.ensureInstructionCapacity(3);

        this.instructionBuffer.writeUInt16BE(opcode, this.instructionOffset);
        this.instructionOffset += 2;
        this.instructionBuffer.writeUInt8(operand, this.instructionOffset);
        this.instructionOffset += 1;
    }

    instructionString(opcode: ServerScriptOpcode, operand: string): void {
        this.instructionCount++;

        const len = operand.length + 1;
        this.ensureInstructionCapacity(2 + len);

        this.instructionBuffer.writeUInt16BE(opcode.id, this.instructionOffset);
        this.instructionOffset += 2;

        this.instructionOffset = this.writeString(this.instructionBuffer, operand, this.instructionOffset);
    }

    switch(id: number, block: () => number): void {
        this.instruction(ServerScriptOpcode.SWITCH, id);

        const sizePos = this.switchOffset;
        this.ensureSwitchCapacity(2);
        this.switchOffset += 2; // placeholder

        const totalKeyCount = block();
        this.switchBuffer.writeUInt16BE(totalKeyCount, sizePos);
    }

    switchCase(key: number, jump: number): void {
        this.ensureSwitchCapacity(8);

        this.switchBuffer.writeInt32BE(key, this.switchOffset);
        this.switchOffset += 4;
        this.switchBuffer.writeInt32BE(jump, this.switchOffset);
        this.switchOffset += 4;
    }

    finish(): Buffer {
        const size = this.calculateBufferSize();
        const buf = Buffer.alloc(size);

        let offset = 0;

        offset = this.writeString(buf, this.script.fullName, offset);
        offset = this.writeString(buf, this.script.sourceName, offset);

        buf.writeInt32BE(this.lookupKey, offset);
        offset += 4;

        if (this.script.trigger === ServerTriggerType.DEBUGPROC) {
            const params = TupleType.toList(this.script.symbol.parameters);
            buf.writeUInt8(params.length, offset++);
            for (const param of params) {
                const code = param.code?.charCodeAt(0) ?? -1;
                buf.writeInt8(code, offset++);
            }
        } else {
            buf.writeUInt8(0, offset++);
        }

        buf.writeUInt16BE(this.lineNumberTable.size, offset);
        offset += 2;

        for (const [pc, line] of this.lineNumberTable) {
            buf.writeInt32BE(pc, offset);
            offset += 4;
            buf.writeInt32BE(line, offset);
            offset += 4;
        }

        this.instructionBuffer.copy(buf, offset, 0, this.instructionOffset);
        offset += this.instructionOffset;

        buf.writeInt32BE(this.instructionCount, offset);
        offset += 4;

        const locals = this.script.locals;
        buf.writeUInt16BE(BaseScriptWriter.getLocalCount(locals, BaseVarType.INTEGER), offset);
        offset += 2;
        buf.writeUInt16BE(BaseScriptWriter.getLocalCount(locals, BaseVarType.STRING), offset);
        offset += 2;
        buf.writeUInt16BE(BaseScriptWriter.getParameterCount(locals, BaseVarType.INTEGER), offset);
        offset += 2;
        buf.writeUInt16BE(BaseScriptWriter.getParameterCount(locals, BaseVarType.STRING), offset);
        offset += 2;

        buf.writeUInt8(this.script.switchTables.length, offset++);
        this.switchBuffer.copy(buf, offset, 0, this.switchOffset);
        offset += this.switchOffset;

        buf.writeUInt16BE(this.switchOffset + 1, offset);

        return buf;
    }

    private calculateBufferSize(): number {
        let size = 0;
        size += this.script.fullName.length + 1;
        size += this.script.sourceName.length + 1;
        size += 4;
        // Account for debugproc parameter type codes
        if (this.script.trigger === ServerTriggerType.DEBUGPROC) {
            const params = TupleType.toList(this.script.symbol.parameters);
            size += 1 + params.length; // count byte + type code bytes
        } else {
            size += 1; // just the 0 byte
        }
        size += this.lineNumberTable.size * 8 + 2;
        size += this.instructionOffset;
        size += 4;
        size += 8;
        size += 1;
        size += this.switchOffset;
        size += 2;
        return size;
    }

    close(): void {
        // no-op in Node; GC handles buffers
    }

    private writeString(buf: Buffer, text: string, offset: number): number {
        for (let i = 0; i < text.length; i++) {
            buf.writeUInt8(text.charCodeAt(i) & 0xff, offset++);
        }
        buf.writeUInt8(0, offset++);
        return offset;
    }
}
