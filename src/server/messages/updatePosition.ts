import { FrameType, UpdatePositionResult } from './types';
import { EntityItem } from '../../entities';
import BufferWriter from './buffer-writer';
import { MovementCommand } from '../../types';

// How to encode this ?
// TODO: Bullets, they need to have direction, all of taht....
// | FrameType : 1 | x : 2 | y : 2 |
export default function createUpdatePosition({
    entityId,
    x,
    y,
    cmd
}: {
    entityId: EntityItem,
    x: number,
    y: number,
    cmd: MovementCommand,
}): Buffer {

    const b = new BufferWriter(9);

    b.write8(FrameType.UpdatePosition);
    b.write24(entityId);
    b.writeStr(cmd);
    b.write16(x);
    b.write16(y);

    return b.buffer;
};

// We will get there
export function readUpdatePosition(buf: Buffer): UpdatePositionResult {

    const entityId = BufferWriter.read24(buf, 1);
    const key = String.fromCharCode(buf[4]);
    const x = BufferWriter.read16(buf, 5);
    const y = BufferWriter.read16(buf, 6);

    return {
        x,
        y,
        entityId,

        // @ts-ignore
        key,
    };
};

