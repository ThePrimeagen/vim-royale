import System from './System';
import {EventData} from '../events';
import GlobalContext from '../context';

import getEntityStore from '../entities';
import ForcePositionComponent from '../objects/components/force-position';
import PositionComponent from '../objects/components/position';
import Board from '../board';

const store = getEntityStore();

class ForcePositionUpdateSystem implements System {

    constructor() { }

    run(e: EventData) {

        // @ts-ignore
        store.forEach(ForcePositionComponent.type, (entity, component: ForcePositionComponent) => {

            // nothing to be updated
            if (!component.x && !component.y) {
                return;
            }

            // TODO: Probably should tell someone about this.... (server)
            const pos = store.getComponent(entity, PositionComponent.type) as PositionComponent;
            let updated = false;

            const newX = pos.x + component.x;
            if (newX >= 1 && newX < this.board.width - 1) {
                pos.x = newX;
                updated = true;
            }

            const newY = pos.y + component.y;
            if (newY >= 1 && newY < this.board.height - 1) {
                pos.y = newY;
                updated = true;
            }

            component.x = 0;
            component.y = 0;
            console.error("Player", GlobalContext.player.movement);

            // TODO: clearly this means I would confirm all things through the
            // movement system.  That is wrong....
            if (updated) {
                GlobalContext.socket.confirmMovement();
            }
        });
    }
}

export default function createMovement(board: Board) {
    return new MovementSystem(board);
};




