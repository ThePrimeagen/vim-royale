import GlobalContext, {LocalContext} from '../context';

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

        }
    }
}



