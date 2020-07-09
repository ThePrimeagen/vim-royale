export default class BufferWriter {
    private ptr: number;
    public buffer: Buffer;

    constructor(length: number) {
        this.buffer = Buffer.allocUnsafe(length);
        this.ptr = 0;
    }

    movePointer(offset: number) {
        this.ptr = offset;
    }

    length(): number {
        return this.ptr;
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

}

