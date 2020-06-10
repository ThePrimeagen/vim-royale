import { FrameType, UpdatePositionResult } from './types';
import { EntityItem } from '../../entities';
import BufferReader from '../../util/buffer-reader';
import BufferWriter from '../../util/buffer-writer';
import { InputCommand } from '../../types';
import createLogger from '../../logger';
const logger = createLogger("UpdatePosition");

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
    cmd: InputCommand,
}): Buffer {

    const b = new BufferWriter(13);

    b.write8(FrameType.UpdatePosition);
    b.write24(entityId);
    b.write24(movementId);
    b.write8(cmd.count);
    b.writeStr(cmd.key);
    b.write16(x);
    b.write16(y);

    logger("createUpdatePosition", b.buffer);

    return b.buffer;
};

const reader = new BufferReader();

// We will get there
export function readUpdatePosition(buf: Buffer, offset: number = 0): UpdatePositionResult {
    // 12

    reader.reset(buf, offset);
    const entityId = reader.read24();
    const movementId = reader.read24();
    const count = reader.read8();
    const key = reader.readChar8();
    const x = reader.read16();
    const y = reader.read16();

    logger("readUpdatePosition", buf);

    return {
        x,
        y,
        entityId,
        movementId,
        key: {
            count,
            key,
        },
    };
};

