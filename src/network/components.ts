import PositionComponent from "../objects/components/position";
import {CommandType, Command} from "../types";
import BufferWriter from "../util/buffer-writer";
import BufferReader from "../util/buffer-reader";

export function encodePosition(pos: PositionComponent, bufferWriter: BufferWriter) {
    // Assumes 1 character
    bufferWriter.writeStr(pos.char[0][0]);

    // 5 bytes
    bufferWriter.write16(pos.x);
    bufferWriter.write16(pos.y);
};

export function decodePosition(bufferReader: BufferReader): PositionComponent {
    return new PositionComponent(
        bufferReader.readChar8(), bufferReader.read16(), bufferReader.read16());
};

export function encodeCommands(commands: Command[], bufferWriter: BufferWriter) {
    bufferWriter.write8(commands.length);
    for (let i = 0; i < commands.length; ++i) {
        bufferWriter.write8(commands[i].type);
        bufferWriter.writeStr(commands[i].char);
    }
};

export function decodeCommands(bufferReader: BufferReader): Command[] {
    const len = bufferReader.read8();
    const commands: Command[] = [];
    for (let i = 0; i < len; ++i) {
        commands.push({
            type: bufferReader.read8() as CommandType,
            char: bufferReader.readChar8(),
        });
    }

    return commands;
};


