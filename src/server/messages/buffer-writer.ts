const dataB24 = Buffer.alloc(4);
const dataV24 = new DataView(dataB24.buffer);

export default class BufferWriter {
    public buffer: Buffer;
    public ptr: number;

    constructor(length: number) {
        this.buffer = Buffer.allocUnsafe(length);
        this.ptr = 0;
    }

    movePointer(offset: number) {
        this.ptr = offset;
    }

    reset(buffer?: Buffer) {
        this.ptr = 0;

        if (buffer) {
            this.buffer = buffer;
        }
    }

    writeStr(str: string) {
        this.ptr += this.buffer.slice(this.ptr).write(str);
    }

    write8(num: number) {
        this.buffer[this.ptr++] = num;
    }

    write16(num: number) {
        this.buffer.writeInt16BE(num, this.ptr);
        this.ptr += 2;
    }

    write24(num: number) {
        this.buffer.writeIntBE(num, this.ptr, 3);
        this.ptr += 3;
    }

    write32(num: number) {
        this.buffer.writeInt32BE(num, this.ptr);
        this.ptr += 4;
    }

    static read24(buffer: Buffer, ptr: number = 0): number {
        dataB24[1] = buffer[ptr++];
        dataB24[2] = buffer[ptr++];
        dataB24[3] = buffer[ptr++];

        return dataV24.getUint32(0);
    }

    static read16(buffer: Buffer, ptr: number = 0): number {
        return buffer.readUInt16BE(ptr);
    }
}

