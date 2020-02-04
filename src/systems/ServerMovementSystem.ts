import System from './System';
import {EventData, ServerMovement} from '../events';
import GlobalContext from '../context';

import getEntityStore from '../entities';
import getMovement from '../input/getMovement';
import MovementComponent from '../objects/components/movement';
import PositionComponent from '../objects/components/position';
import Board from '../board';
import {readUpdatePosition} from '../server/messages/updatePosition';
import createCorrectPosition, {readCorrectPosition} from '../server/messages/correctPosition';

const store = getEntityStore();
const FORCE_MOVEMENT_AMOUNT = 1000;

class ServerMovementSystem implements System {
    private board: Board;

    constructor(board: Board) {
        this.board = board;
    }

    run(listOfMovements: EventData) {

        const data = (listOfMovements as ServerMovement).data

        data.forEach(({buf, tracking}) => {
            const update = readUpdatePosition(buf, 1);
            const movement = getMovement(update.key);

            const position =
                store.getComponent(update.entityId, PositionComponent.type) as PositionComponent;

            // We got a problem
            const expectedX = position.x + movement[0];
            const expectedY = position.y + movement[1];

            if (expectedX !== update.x || expectedY !== update.y) {
                // this is insane way to do it, but we are doing it this way
                // baby.
                // TODO: there must be IDs associated with this.
                const buf = createCorrectPosition({
                    x: position.x,
                    y: position.y,
                    entityId: update.entityId,
                    nextId: update.movementId + FORCE_MOVEMENT_AMOUNT,
                });

                tracking.ws.send(buf);
                console.log("Movement Deninced!!!!", position.x, position.y);
            }
            else {
                position.x += movement[0];
                position.y += movement[1];

                console.log("Movement Approved!!!!", position.x, position.y);
            }
        });
    }
}

export default function createMovement(board: Board) {
    return new ServerMovementSystem(board);
};

