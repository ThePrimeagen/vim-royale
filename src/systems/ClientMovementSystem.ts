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
    private movementId = 0;

    constructor(board: Board, context: LocalContext) {
        this.board = board;
        this.context = context;
    }

    // TODO: Girth?
    run(diff: number) {

        this.context.store.forEach(MovementComponent, (entity, component: MovementComponent) => {

            // nothing to be updated
            if (!component.x && !component.y) {
                return;
            }

            // TODO: Probably should tell someone about this.... (server)
            // @ts-ignore
            const pos = this.context.store.getComponent(entity, PositionComponent) as PositionComponent;
            // @ts-ignore
            const force = this.context.store.getComponent(entity, ForcePositionComponent) as ForcePositionComponent;

            if (force && force.force) {
                pos.x = force.x;
                pos.y = force.y;
                this.movementId = force.movementId;

                component.x = 0;
                component.y = 0;
                force.x = 0;
                force.y = 0;
                force.force = false;
                logger("Force position update to", this.context.id, pos, this.movementId);
                return;
            }

            let updated = false;

            const oldX = pos.x;
            const newX = pos.x + component.x;
            if (newX >= 1 && newX < this.board.width - 1) {
                pos.x = newX;
                updated = true;
            }

            const oldY = pos.y;
            const newY = pos.y + component.y;
            if (newY >= 1 && newY < this.board.height - 1) {
                pos.y = newY;
                updated = true;
            }

            component.x = 0;
            component.y = 0;

            // TODO: clearly this means I would confirm all things through the
            // movement system.  That is wrong....
            if (updated && this.context.player.position === pos) {
                const id = this.movementId++;
                logger("Confirming movement", this.context.id, id, pos);
                this.context.socket.confirmMovement(id);
            }

            // @ts-ignore
            const lifetime = this.context.store.
                getComponent(entity, LifetimeComponent) as LifetimeComponent;

            if (lifetime && !lifetime.decrementOnMs) {
                lifetime.tilesOrMs -= Math.abs(newY - oldY + newX - oldX);
            }
        });
    }
}



