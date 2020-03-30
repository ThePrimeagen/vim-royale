import GlobalContext, {LocalContext} from '../context';

import CreateEntityComponent from '../objects/components/create-entity';
import getLogger from '../logger';

const logger = getLogger("ClientCreateEntitySystem");

const outArray: CreateEntityComponent[] = [];
export default class ClientCreateEntitySystem {
    private context: LocalContext;

    constructor(context: LocalContext) {
        this.context = context;
    }

    run() {
        const createEntities =
            this.context.store.toArray<CreateEntityComponent>(CreateEntityComponent, outArray);

        for (let i = createEntities.length - 1; i >= 0; --i) {
            const entity = createEntities[i];

            this.context.socket.createEntity(entity.enc, entity.dec);

            this.context.store.
                removeComponent(entity.entityId, CreateEntityComponent);
        }

        outArray.length = 0;
    }
}




