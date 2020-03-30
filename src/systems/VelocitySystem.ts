import {GameOptions} from "../types";
import {EventData} from "../events";
import {EntityItem} from "../entities";
import GlobalContext, {LocalContext} from "../context";

import VelocityComponent from "../objects/components/velocity";
import MovementComponent from "../objects/components/movement";
import SyncPool from "../util/SyncObjectPool";

import getLogger from "../logger";
import {MovementAndEntity} from './types';

const logger = getLogger("VelocitySystem");
const pool = new SyncPool();
const movements: MovementAndEntity[] = [];

let movementPtr: number = 0;

export default class VelocitySystem {
    private context: LocalContext;

    constructor(context: LocalContext) {
        this.context = context;
    }

    // Delta may not be the actualy delta from the velocity components creation.
    run(delta: number): MovementAndEntity[] {
        // TODO: Consider game clock.  Slow mo / pause?  Is that needed?
        const now = Date.now();
        const context = this.context;

        movementPtr = 0;

        function forEach(entity: EntityItem, component: VelocityComponent) {
            const diff = Math.min(now - component.createdAt, delta) / 1000;
            const movement = context.store.
                // @ts-ignore
                getComponent<MovementComponent>(entity, MovementComponent);

            // TODO: Round and adjust the movement
            const x = Math.floor(component.x);
            const y = Math.floor(component.y);

            component.x += component.velX * diff;
            component.y += component.velY * diff;

            // Set this...? or add it?
            movement.x += Math.floor(component.x) - x;
            movement.y += Math.floor(component.y) - y;

            if (movement.x || movement.y) {
                const obj = pool.malloc() as MovementAndEntity;
                obj.entityId = entity;
                obj.movement = movement;
                movements[movementPtr++] = obj;
            }
        }

        movements.length = movementPtr;
        this.context.store.forEach(VelocityComponent, forEach);

        return movements;
    }
}



