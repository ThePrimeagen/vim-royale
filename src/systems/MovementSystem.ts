import {GameOptions} from '../types';
import System from './System';
import {EventData} from '../events';
import GlobalContext from '../context';

import getEntityStore from '../entities';
import MovementComponent from '../objects/components/movement';
import PositionComponent from '../objects/components/position';

const store = getEntityStore();

class MovementSystem implements System {
    constructor() { }

    run(e: EventData) {
        console.error("MovementSystem#run");

        store.forEach(MovementComponent.type, (entity, component: MovementComponent) => {
            console.error("Entity", entity, component);

            // nothing to be updated
            if (!component.x && !component.y) {
                return;
            }

            // TODO: Probably should tell someone about this.... (server)
            const pos = store.getComponent(entity, PositionComponent.type) as PositionComponent;
            console.error("position", entity, pos);
            pos.x += component.x;
            pos.y += component.y;

            component.x = 0;
            component.y = 0;
        });
    }
}

export default function createMovement() {
    return new MovementSystem();
};



