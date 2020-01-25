enum MessageType {
    Position = 0,
}

class BufferWriter {
    private buffer: Buffer;
    private ptr: number;

    constructor(length: number) {
        this.buffer = Buffer.alloc(length);
        this.ptr = 0;
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

    static createPosition(x: number, y: number): Buffer {
        const buf = new BufferWriter(5);
        buf.write8(MessageType.Position);
        buf.write16(x);
        buf.write16(y);

        return buf.buffer;
    }
}


