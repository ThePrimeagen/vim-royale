const dataB24 = Buffer.alloc(4);
const dataV24 = new DataView(dataB24.buffer);

export default class BufferReader {
    public buffer: Buffer;
    private ptr: number;

    constructor() { }

    reset(buffer: Buffer, offset: number) {
        this.buffer = buffer;
        this.ptr = offset;
    }

    read24(): number {
        const out = this.buffer.readIntBE(this.ptr, 3);
        this.ptr += 3;

        return out;
    }

    read16(): number {
        const out = this.buffer.readInt16BE(this.ptr);
        this.ptr += 2;

        return out;
    }

    read8(): number {
        return this.buffer.readInt8(this.ptr++);
    }

    readChar8(): string {
        return String.fromCharCode(this.read8());
    }

    static read24(buffer: Buffer, ptr: number = 0): number {
        return buffer.readUIntBE(ptr, 3);
    }

    static read16(buffer: Buffer, ptr: number = 0): number {
        return buffer.readUInt16BE(ptr);
    }
}

