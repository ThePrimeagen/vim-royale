import {GameOptions} from '../types';
import System from './System';
import {EventData} from '../events';
import GlobalContext from '../context';

import getEntityStore from '../entities';
import MovementComponent from '../objects/components/movement';
import PositionComponent from '../objects/components/position';
import ForcePositionComponent from '../objects/components/force-position';
import Board from '../board';

const store = getEntityStore();

export default class MovementSystem implements System {
    private board: Board;
    private movementId = 0;

    constructor(board: Board) {
        this.board = board;
    }

    // TODO: Girth?
    run(e: EventData) {

        store.forEach(MovementComponent, (entity, component: MovementComponent) => {

            // nothing to be updated
            if (!component.x && !component.y) {
                return;
            }

            // TODO: Probably should tell someone about this.... (server)
            // @ts-ignore
            const pos = store.getComponent(entity, PositionComponent) as PositionComponent;
            // @ts-ignore
            const force = store.getComponent(entity, ForcePositionComponent) as ForcePositionComponent;

            if (force && force.force) {
                pos.x = force.x;
                pos.y = force.y;
                this.movementId = force.movementId;

                component.x = 0;
                component.y = 0;
                force.x = 0;
                force.y = 0;
                force.force = false;
                console.error("Force position update to", pos, this.movementId);
                return;
            }

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
            if (updated && GlobalContext.player.position === pos) {
                GlobalContext.socket.confirmMovement(this.movementId++);
            }
        });
    }
}



