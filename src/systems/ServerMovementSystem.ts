import System from './System';
import {EventData, ServerMovement} from '../events';
import GlobalContext, {LocalContext} from '../context';

import getMovement from '../input/getMovement';
import MovementComponent from '../objects/components/movement';
import PositionComponent from '../objects/components/position';
import Board from '../board';
import {readUpdatePosition} from '../server/messages/updatePosition';
import createCorrectPosition, {readCorrectPosition} from '../server/messages/correctPosition';

const FORCE_MOVEMENT_AMOUNT = 1000;

export default class ServerMovementSystem implements System {
    private board: Board;
    private context: LocalContext;

    constructor(board: Board, context: LocalContext) {
        this.board = board;
        this.context = context;
    }

    run(listOfMovements: EventData) {

        const data = (listOfMovements as ServerMovement).data

        data.forEach(({buf, tracking}) => {
            const update = readUpdatePosition(buf, 1);

            console.log("We are updating the server right MEOW",
                tracking.movementId,
                tracking.entityIdRange,
                update.entityId);

            // We need to ignore this movement.
            if (tracking.movementId > update.movementId) {
                return;
            }

            if (tracking.entityIdRange[0] > update.entityId ||
                tracking.entityIdRange[1] < update.entityId) {

                // We should definitely just kick the websocket out.
                // TODO: Send endgame message, they are messing with the stones.
                tracking.ws.close();
                return;
            }

            const movement = getMovement(update.key);

            // WHAT THE F
            const position =
            // @ts-ignore
                this.context.store.getComponent(update.entityId, PositionComponent) as PositionComponent;

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
                tracking.movementId = update.movementId;

                console.log("Movement Approved!!!!", position.x, position.y);
            }
        });
    }
}

