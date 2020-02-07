import { FrameType, GameStateUpdateResults } from './types';
import { EntityItem } from '../../entities';
import BufferWriter from './buffer-writer';
import BufferReader from './buffer-reader';

export enum StateType {
    PlayerMovement = 0x1,
    PlaceBullet = 0x2,
}

type PlayerMovementArgs = {entityId: number, char: string, x: number, y: number};

export default {
    playerMovement({entityId, char, x, y}: PlayerMovementArgs): Buffer {

        const b = new BufferWriter(10);
        b.write8(FrameType.GameStateUpdate);
        b.write8(StateType.PlayerMovement);
        b.write24(entityId);
        b.writeStr(char);
        b.write16(x);
        b.write16(y);

        reader.reset(b.buffer, 0);
        return b.buffer;
    }
};

const reader = new BufferReader();
export function readGameStateUpdate(buffer: Buffer, offset: number = 0): GameStateUpdateResults {
    reader.reset(buffer, offset);

    // PlayerMovement
    reader.read8();

    // TODO: Assumes PlayerMovement only... stop it
    return {
        entityId: reader.read24(),
        char: reader.readChar8(),
        x: reader.read16(),
        y: reader.read16(),
    };
};

export function isGameStateUpdate(buf: Buffer, offset: number = 0): boolean {
    return buf[offset] === FrameType.GameStateUpdate;
}



