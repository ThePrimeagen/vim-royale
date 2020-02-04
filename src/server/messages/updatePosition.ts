import { FrameType, UpdatePositionResult } from './types';
import { EntityItem } from '../../entities';
import BufferWriter from './buffer-writer';
import { MovementCommand } from '../../types';

// How to encode this ?
// TODO: Bullets, they need to have direction, all of taht....
// | FrameType : 1 | x : 2 | y : 2 |
export default function createUpdatePosition({
    entityId,
    movementId,
    x,
    y,
    cmd
}: {
    entityId: EntityItem,
    movementId: number,
    x: number,
    y: number,
    cmd: MovementCommand,
}): Buffer {

    const b = new BufferWriter(12);

    b.write8(FrameType.UpdatePosition);
    b.write24(entityId);
    b.write24(movementId);
    b.writeStr(cmd);
    b.write16(x);
    b.write16(y);

    return b.buffer;
};

// We will get there
export function readUpdatePosition(buf: Buffer, offset: number = 0): UpdatePositionResult {

    const entityId = BufferWriter.read24(buf, offset);
    const movementId = BufferWriter.read24(buf, offset + 3);
    const key = String.fromCharCode(buf[offset + 6]);
    const x = BufferWriter.read16(buf, offset + 7);
    const y = BufferWriter.read16(buf, offset + 9);

    return {
        x,
        y,
        entityId,
        movementId,

        // @ts-ignore
        key,
    };
};

