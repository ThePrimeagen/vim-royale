import GlobalContext, {LocalContext} from '../context';

import { createEntity } from '../server/messages';
import CreateEntityComponent from '../objects/components/create-entity';
import {TrackingInfo} from '../types';
import getLogger from '../logger';

const logger = getLogger("ServerCreateEntitySystem");

const obj = {
    entityId: 0,
    // TODO: If we scale everything this will have to be rethought of
    char: 'x',
    x: 0,
    y: 0,
};

const outArray: CreateEntityComponent[] = [];
export default class ServerCreateEntitySystem {
    private context: LocalContext;

    constructor(context: LocalContext) {
        this.context = context;
    }

    run(listOfTrackingInfos: TrackingInfo[]) {
        const createEntities =
            this.context.store.toArray<CreateEntityComponent>(CreateEntityComponent, outArray);

        for (let i = createEntities.length - 1; i >= 0; --i) {
            // probably better to create the buffer once.
            const entity = createEntities[i];
            let entityBuffer: Buffer | null = null;

            for (let j = listOfTrackingInfos.length - 1; j >= 0; --j) {
                const item = listOfTrackingInfos[j];

                logger("Entity", entity.entityId, "comparing against range", item.entityIdRange);
                if (entity.entityId >= item.entityIdRange[0] &&
                    entity.entityId < item.entityIdRange[1]) {
                    continue;
                }

                if (!entityBuffer) {
                    entityBuffer = createEntity(entity.enc, entity.dec.encodeLength);
                }

                logger("Sending Entity", entity.entityId);
                item.ws.send(entityBuffer);
            }

            logger("Removing Entity", entity.entityId);
            this.context.store.
                removeComponent(entity.entityId, CreateEntityComponent);
        }

        outArray.length = 0;
    }
}
