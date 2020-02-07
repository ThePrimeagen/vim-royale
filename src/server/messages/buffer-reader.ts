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
        dataB24[1] = this.buffer[this.ptr++];
        dataB24[2] = this.buffer[this.ptr++];
        dataB24[3] = this.buffer[this.ptr++];

        return dataV24.getUint32(0);
    }

    read16(): number {
        const out = this.buffer.readUInt16BE(this.ptr);
        this.ptr += 2;

        return out;
    }

    read8(): number {
        return this.buffer.readUInt8(this.ptr++);
    }

    readChar8(): string {
        return String.fromCharCode(this.read8());
    }
}

