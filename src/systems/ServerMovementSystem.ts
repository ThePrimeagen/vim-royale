import System from './System';
import {EventData, ServerMovement} from '../events';
import GlobalContext from '../context';

import getEntityStore from '../entities';
import getMovement from '../input/getMovement';
import MovementComponent from '../objects/components/movement';
import PositionComponent from '../objects/components/position';
import Board from '../board';
import {readUpdatePosition} from '../server/messages/updatePosition';

const store = getEntityStore();

class ServerMovementSystem implements System {
    private board: Board;

    constructor(board: Board) {
        this.board = board;
    }

    run(listOfMovements: EventData) {

        const buffers = (listOfMovements as ServerMovement).data

        buffers.forEach(buf => {
            const update = readUpdatePosition(buf);
            const movement = getMovement(update.key);

            const position =
                store.getComponent(update.entityId, PositionComponent.type) as PositionComponent;

            // We got a problem
            if (position.x + movement[0] !== update.x ||
                position.y + movement[1] !== update.y) {

                throw new Error("WHY WAS THIS DONE.  DON'T YOU LOVE ME");
            }

            position.x += movement[0];
            position.y += movement[1];

            console.log("Movement Approved!!!!", position.x, position.y);
        });

        // @ts-ignore
        store.forEach(MovementComponent.type, (entity, component: MovementComponent) => {

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

            // TODO: clearly this means I would confirm all things through the
            // movement system.  That is wrong....
            if (updated) {
                GlobalContext.socket.confirmMovement();
            }
        });
    }
}

export default function createMovement(board: Board) {
    return new ServerMovementSystem(board);
};



