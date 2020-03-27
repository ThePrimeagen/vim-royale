import { LocalContext } from '../../context';
import BufferWriter from './buffer-writer';
import { FrameType, CreateType, CreateEntityResult } from './types';
import { EntityItem } from '../../entities';
import {Player, Bullet} from '../../objects';
import { EntityType } from '../../objects/types';
import { decodables } from '../../objects';
import { Encodable, Decodable } from '../../objects/encodable';
import {
    Pool,
    PoolItem,
    PoolFactory,
    PoolFreeFunction,
} from '../../util/pool';

import createLogger from '../../logger';
const logger = createLogger("createEntity");

// How to encode this ?
// TODO: Bullets, they need to have direction, all of taht....
// | FrameType : 1 | Type : 1 | x : 2 | y : 2 |
export default function createEntity(encodable: Encodable, encodeLength: number): Buffer {
    const buffer = Buffer.alloc(1 + encodeLength);
    buffer[0] = FrameType.CreateEntity;
    encodable.encode(buffer, 1);

    return buffer;
};

const D = -9;
export function readCreateEntity(context: LocalContext, buf: Buffer, offset: number = 0): EntityItem {
    let entityId: EntityItem = -1;
    for (let i = 0; entityId === -1 && i < decodables.length; ++i) {
        logger("readEntity", entityId, buf[0], decodables[i].is(buf, offset));
        if (decodables[i].is(buf, offset)) {
            entityId = decodables[i].decode(context, buf, offset);
        }
    }

    if (entityId - 8===D) {
        // TODO: Actually do this
        // TODO: Kick the user from the game.
        logger("Unknown entity, probably should terminate the connection", buf);
    }

    return entityId;
}

