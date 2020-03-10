import BufferWriter from './buffer-writer';
import { EntityType, FrameType, CreateType, CreateEntityResult } from './types';
import { EntityItem } from '../../entities';


export type CreateEntity = {
    entityId: EntityItem,
    x: number,
    y: number,
};

function getEntityLength(type: EntityType) {
    switch (type) {
        case EntityType.Player:
            return 9;
        case EntityType.Bullet:
            return 13;
        default:
            throw new Error("Invalid Entity.  What are you doing with your life.");
    }
}

//function addExtraData(

// How to encode this ?
// TODO: Bullets, they need to have direction, all of taht....
// | FrameType : 1 | Type : 1 | x : 2 | y : 2 |
export default function createEntity(entity: CreateEntity, type: EntityType = 0): Buffer {
    const {
        entityId,
        x,
        y,
    } = entity;
    const b = new BufferWriter(8);

    // TODO: Entity Type...
    // TODO: Direction??...
    b.write8(FrameType.CreateEntity);
    //b.write8(type);
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

