import { FrameType, GameStateUpdateResults, GameStateType } from './types';
import { EntityItem } from '../../entities';
import BufferWriter from './buffer-writer';
import BufferReader from './buffer-reader';

type PlayerMovementArgs = {entityId: number, char: string, x: number, y: number};

export default {
    playerMovement({entityId, char, x, y}: PlayerMovementArgs): Buffer {

        const b = new BufferWriter(10);
        b.write8(FrameType.GameStateUpdate);
        b.write8(GameStateType.PlayerMovement);
        b.write24(entityId);
        b.writeStr(char);
        b.write16(x);
        b.write16(y);

        return b.buffer;
    },

    removeEntityRange(range: [number, number]) {
        const b = new BufferWriter(8);
        b.write8(FrameType.GameStateUpdate);
        b.write8(GameStateType.RemoveEntityRange);
        b.write24(range[0]);
        b.write24(range[1]);

        return b.buffer;
    }
};

const reader = new BufferReader();
export function readGameStateUpdate(buffer: Buffer, offset: number = 0): GameStateUpdateResults {
    reader.reset(buffer, offset);

    // PlayerMovement
    const type = reader.read8();
    let out: GameStateUpdateResults;

    switch (type) {
        case GameStateType.PlayerMovement:
            out = {
                type,
                entityId: reader.read24(),
                char: reader.readChar8(),
                x: reader.read16(),
                y: reader.read16(),
            };
            break;
        case GameStateType.RemoveEntityRange:
            out = {
                type,
                from: reader.read24(),
                to: reader.read24(),
            };
            break;
    }

    return out;
};

export function isGameStateUpdate(buf: Buffer, offset: number = 0): boolean {
    return buf[offset] === FrameType.GameStateUpdate;
}

