import GlobalContext, {LocalContext} from "../context";
import {EntityItem} from "../entities";

import NetworkSyncComponent from "../objects/components/network-sync";
import MovementCommand from "../objects/components/movement";
import getLogger from "../logger";

const logger = getLogger("ClientCreateEntitySystem");

const outArray: NetworkSyncComponent[] = [];
export default class ClientNetworkSyncSystem {
    private context: LocalContext;

    constructor(context: LocalContext) {
        this.context = context;
    }

    run() {
        // TODO: I HATE THESE LONG THINGS
        const store = this.context.store;
        store.forEach<NetworkSyncComponent>(NetworkSyncComponent, (entityId: EntityItem, _: NetworkSyncComponent) => {
            const movement = store.getComponent<MovementCommand>(entityId, MovementCommand);

            if (movement.x || movement.y) {
                this.context.socket.confirmMovement(movement.movementId++);
            }
        });
    }
}





