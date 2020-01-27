export enum MessageType {
    Position = 0,
}

const dataB24 = Buffer.alloc(4);
const dataV24 = new DataView(dataB24);

export default class BufferWriter {
    private buffer: Buffer;
    private ptr: number;

    constructor(length: number) {
        this.buffer = Buffer.allocUnsafe(length);
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

    write24(num: number) {
        dataV24.setUint32(0, num);
        this.buffer[this.ptr++] = dataB24[1];
        this.buffer[this.ptr++] = dataB24[2];
        this.buffer[this.ptr++] = dataB24[3];
    }

    write32(num: number) {
        this.buffer.writeUInt32BE(num, this.ptr);
        this.ptr += 4;
    }

    // 9 bytes
    static createPosition(entityId: number, x: number, y: number): Buffer {
        const buf = new BufferWriter(9);
        buf.write8(MessageType.Position);
        buf.write24(entityId);
        buf.write16(x);
        buf.write16(y);

        // TODO: What made you move this far?
        // Think about jkhl, then f / t

        return buf.buffer;
    }
}


