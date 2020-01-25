import {GameOptions} from '../types';
import System from './System';
import {EventData} from '../events';
import GlobalContext from '../context';

import getEntityStore from '../entities';
import MovementComponent from '../objects/components/movement';
import PositionComponent from '../objects/components/position';
import confirmMovement from './confirmMovementWithServer';
import Board from '../board';

const store = getEntityStore();

class MovementSystem implements System {
    private board: Board;

    constructor(board: Board) {
        this.board = board;
    }

    run(e: EventData) {

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

            if (updated) {
                confirmMovement(pos);
            }
        });
    }
}

export default function createMovement(board: Board) {
    return new MovementSystem(board);
};



