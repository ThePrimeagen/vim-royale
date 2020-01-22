import {GameOptions} from '../types';
import System from './System';
import {EventData} from '../events';
import GlobalContext from '../context';

import getEntityStore from '../entities';
import MovementComponent from '../objects/components/movement';
import PositionComponent from '../objects/components/position';
import Board from '../board';

const store = getEntityStore();

class MovementSystem implements System {
    private board: Board;

    constructor(board: Board) {
        this.board = board;
    }

    run(e: EventData) {

        store.forEach(MovementComponent.type, (entity, component: MovementComponent) => {

            // nothing to be updated
            if (!component.x && !component.y) {
                return;
            }

            // TODO: Probably should tell someone about this.... (server)
            const pos = store.getComponent(entity, PositionComponent.type) as PositionComponent;

            const newX = pos.x + component.x;
            if (newX >= 1 && newX < this.board.map.length - 1) {
                pos.x = newX;
            }

            const newY = pos.y + component.y;
            if (newY >= 1 && newY < this.board.map[0].length - 1) {
                pos.y = newY;
            }

            component.x = 0;
            component.y = 0;
        });
    }
}

export default function createMovement(board: Board) {
    return new MovementSystem(board);
};



