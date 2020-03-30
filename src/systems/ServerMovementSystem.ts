import {MovesToProcess, EventData, ServerMovement} from '../events';
import GlobalContext, {LocalContext} from '../context';

import getMovement from '../input/getMovement';
import LifetimeComponent from '../objects/components/lifetime';
import MovementComponent from '../objects/components/movement';
import PositionComponent from '../objects/components/position';
import Board from '../board';
import {readUpdatePosition} from '../server/messages/updatePosition';
import createCorrectPosition, {readCorrectPosition} from '../server/messages/correctPosition';
import {MovementAndEntity} from './types';

import getLogger from '../logger';

const logger = getLogger("ServerMovementSystem");

const FORCE_MOVEMENT_AMOUNT = 1000;

export default class ServerMovementSystem {
    private board: Board;
    private context: LocalContext;

    constructor(board: Board, context: LocalContext) {
        this.board = board;
        this.context = context;
    }

    run(listOfMovements: MovesToProcess[], movements: MovementAndEntity[]) {
        // TODO: Screaming: Refactor, please
        for (let i = 0; i < movements.length; ++i) {
            const {
                movement,
                entityId
            } = movements[i];

            const x = Math.abs(movement.x);
            const y = Math.abs(movement.y);

            LifetimeComponent.move(this.context, entityId, x + y);

            // @ts-ignore
            const position = this.context.store.getComponent<PositionComponent>(entityId, PositionComponent) as PositionComponent;

            position.x += movement.x;
            position.y += movement.y;
            movement.x = 0;
            movement.y = 0;
        }

        listOfMovements.forEach(({buf, tracking}) => {
            const update = readUpdatePosition(buf, 1);

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
            logger("Movement", movement);

            const position = this.context.store.getComponent<PositionComponent>(update.entityId, PositionComponent);
            logger("Position", position, update);

            //
            // We got a problem
            const expectedX = position.x + movement[0];
            const expectedY = position.y + movement[1];

            logger("Expected vs Update", expectedX !== update.x, "||", expectedY !== update.y);
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
                logger("Movement Deninced!!!!", position.x, position.y);
            }

            else {
                position.x += movement[0];
                position.y += movement[1];
                tracking.movementId = update.movementId;

                logger("Movement Approved!!!!", position.x, position.y);
                const moveTotal = Math.abs(movement[0]) + Math.abs(movement[1]);
            }

        });

    }
}

