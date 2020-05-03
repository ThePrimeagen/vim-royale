import { FrameType, GameStateUpdateResults, GameStateType } from './types';
import BufferWriter from '../../util/buffer-writer';
import BufferReader from '../../util/buffer-reader';

type EntityMovementArgs = {entityId: number, char: string, x: number, y: number};

const PLAYER_MOVEMENT_SIZE = 10;

export {
    PLAYER_MOVEMENT_SIZE,
}

export default {
    entityPositionUpdate({entityId, char, x, y}: EntityMovementArgs, b?: BufferWriter): Buffer {

        b = b || new BufferWriter(PLAYER_MOVEMENT_SIZE);
        b.write8(FrameType.GameStateUpdate);
        b.write8(GameStateType.EntityMovement);
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

    // EntityMovement
    const type = reader.read8();
    let out: GameStateUpdateResults;

    switch (type) {
        case GameStateType.EntityMovement:
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

