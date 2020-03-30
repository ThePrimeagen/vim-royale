import {GameOptions} from '../types';
import {EventData} from '../events';
import GlobalContext, {LocalContext} from '../context';

import MovementComponent from '../objects/components/movement';
import PositionComponent from '../objects/components/position';
import LifetimeComponent from '../objects/components/lifetime';
import ForcePositionComponent from '../objects/components/force-position';
import Board from '../board';
import getLogger from '../logger';
const logger = getLogger("ClientMovementSystem");

export default class MovementSystem {
    private board: Board;
    private context: LocalContext;

    constructor(board: Board, context: LocalContext) {
        this.board = board;
        this.context = context;
    }

    run() {

        this.context.store.forEach(MovementComponent, (entity, component: MovementComponent) => {

            // nothing to be updated
            if (!component.x && !component.y) {
                return;
            }

            // TODO: Probably should tell someone about this.... (server)
            const pos = this.context.store.getComponent<PositionComponent>(entity, PositionComponent);
            const force = this.context.store.getComponent<ForcePositionComponent>(entity, ForcePositionComponent);

            // TODO: Refactor into its own system....
            if (force && force.force) {
                pos.x = force.x;
                pos.y = force.y;
                component.movementId = force.movementId;

                component.x = 0;
                component.y = 0;
                force.x = 0;
                force.y = 0;
                force.force = false;
                logger("Force position update to", this.context.id, pos, component.movementId);
                return;
            }

            const oldX = pos.x;
            const newX = pos.x + component.x;
            if (newX >= 1 && newX < this.board.width - 1) {
                pos.x = newX;
            }

            const oldY = pos.y;
            const newY = pos.y + component.y;
            if (newY >= 1 && newY < this.board.height - 1) {
                pos.y = newY;
            }

            const moveTotal = Math.abs(newY - oldY) + Math.abs(newX - oldX);
            LifetimeComponent.move(this.context, entity, moveTotal);
        });
    }

    reset() {
        this.context.store.forEach(MovementComponent, (entity, component: MovementComponent) => {
            component.x = 0;
            component.y = 0;
        });
    }
}



