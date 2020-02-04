import BufferWriter from './buffer-writer';
import { FrameType, CreateType, CreateEntityResult } from './types';
import { EntityItem } from '../../entities';

// How to encode this ?
// TODO: Bullets, they need to have direction, all of taht....
// | FrameType : 1 | Type : 1 | x : 2 | y : 2 |
export default function createEntity({
    entityId,
    x,
    y,
}: {
    entityId: EntityItem, x: number, y: number,
}): Buffer {
    const b = new BufferWriter(8);

    // TODO: Entity Type...
    // TODO: Direction??...
    b.write8(FrameType.CreateEntity);
    b.write24(entityId);
    b.write16(x);
    b.write16(y);

    return b.buffer;
};

export function readCreateEntity(buf: Buffer, offset: number = 0): CreateEntityResult {
    const out = {} as CreateEntityResult;

    out.entityId = BufferWriter.read24(buf, offset);
    offset += 3;

    out.x = BufferWriter.read16(buf, offset);
    out.y = BufferWriter.read16(buf, offset + 2);

    return out;
}

