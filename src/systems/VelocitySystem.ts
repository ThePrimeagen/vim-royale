import {GameOptions} from "../types";
import System from "./System";
import {EventData} from "../events";
import {EntityItem} from "../entities";
import GlobalContext, {LocalContext} from "../context";

import VelocityComponent from "../objects/components/velocity";
import MovementComponent from "../objects/components/movement";

import getLogger from "../logger";

const logger = getLogger("VelocitySystem");

export default class VelocitySystem implements System {
    private context: LocalContext;

    constructor(context: LocalContext) {
        this.context = context;
    }

    // Delta may not be the actualy delta from the velocity components creation.
    run(e: EventData, delta: number) {
        // TODO: Consider game clock.  Slow mo / pause?  Is that needed?
        const now = Date.now();
        const context = this.context;

        function forEach(entity: EntityItem, component: VelocityComponent) {
            const diff = Math.min(now - component.createdAt, delta);
            const movement = context.store.
                // @ts-ignore
                getComponent<MovementComponent>(entity, MovementComponent);

            const tilesX = component.velX * diff;
            const tilesY = component.velY * diff;

            // TODO: Round and adjust the movement
        }

        this.context.store.forEach(VelocityComponent, forEach);
    }
}



