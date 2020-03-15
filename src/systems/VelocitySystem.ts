import {GameOptions} from "../types";
import {EventData} from "../events";
import {EntityItem} from "../entities";
import GlobalContext, {LocalContext} from "../context";

import VelocityComponent from "../objects/components/velocity";
import MovementComponent from "../objects/components/movement";

import getLogger from "../logger";

const logger = getLogger("VelocitySystem");

export default class VelocitySystem {
    private context: LocalContext;

    constructor(context: LocalContext) {
        this.context = context;
    }

    // Delta may not be the actualy delta from the velocity components creation.
    run(delta: number) {
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
            const x = Math.floor(component.x);
            const y = Math.floor(component.y);

            component.x += tilesX;
            component.y += tilesY;

            // Set this...? or add it?
            movement.x += Math.floor(component.x) - x;
            movement.y += Math.floor(component.y) - y;
        }

        this.context.store.forEach(VelocityComponent, forEach);
    }
}



