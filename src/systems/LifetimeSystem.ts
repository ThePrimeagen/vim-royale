import {EventData} from "../events";
import {EntityItem} from "../entities";
import GlobalContext, {LocalContext} from "../context";

import LifetimeComponent from "../objects/components/lifetime";

import getLogger from "../logger";

const logger = getLogger("LifetimeSystem");

export default class LifetimeSystem {
    private context: LocalContext;

    constructor(context: LocalContext) {
        this.context = context;
    }

    run() {
        const context = this.context;

        function forEach(entity: EntityItem, component: LifetimeComponent) {
            if (component.tilesOrMs <= 0) {
                context.store.removeEntity(entity);
            }
        }

        this.context.store.forEach(LifetimeComponent, forEach);
    }
}



