import System from "./System";
import {EventData} from "../events";
import {EntityItem} from "../entities";
import GlobalContext, {LocalContext} from "../context";

import LifetimeComponent from "../objects/components/lifetime";

import getLogger from "../logger";

const logger = getLogger("LifetimeSystem");

export default class LifetimeSystem implements System {
    private context: LocalContext;

    constructor(context: LocalContext) {
        this.context = context;
    }

    // TODO: MS???? We need to figure that out
    // Time based will always be client side only such as health hit markers
    run(e: EventData) {

        function forEach(entity: EntityItem, component: LifetimeComponent) {
            if (component.tilesOrMs <= 0) {
                // TODO: Destroy the entity
            }
        }

        this.context.store.forEach(LifetimeComponent, forEach);
    }
}



