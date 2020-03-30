import {EventData} from "../events";
import {EntityItem} from "../entities";
import GlobalContext, {LocalContext} from "../context";

import MovementComponent from "../objects/components/movement";
import LifetimeComponent from "../objects/components/lifetime";

import getLogger from "../logger";

const logger = getLogger("LifetimeSystem");

const EMPTY_ARRAY: MovementComponent[] = [];

export default class LifetimeSystem {
    private context: LocalContext;

    constructor(context: LocalContext) {
        this.context = context;
    }

    run(diff: number, movements: MovementComponent[] = EMPTY_ARRAY) {
        const context = this.context;

        function forEach(entity: EntityItem, component: LifetimeComponent) {
            if (!component.isAlive()) {
                context.store.removeEntity(entity);
            }
        }

        this.context.store.forEach(LifetimeComponent, forEach);
    }
}



