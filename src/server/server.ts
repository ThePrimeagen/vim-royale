import getEvents, {EventType} from '../events';
import { FrameType } from './messages/types';
import {readCreateEntity} from './messages/createEntity';
import {readUpdatePosition} from './messages/updatePosition';
import PositionComponent from '../objects/components/position';
import MovementComponent from '../objects/components/movement';
import serverMovementSystem from '../systems/ServerMovementSystem';
import Board from '../board';
import getStore from '../entities';

const store = getStore();
const events = getEvents();

function getNextLoop(tick: number, timeTaken: number) {
    // TODO: This is really bad to have happen.p..
    if (timeTaken >= tick) {
        return 0;
    }

    return tick - timeTaken;
}

const sliceCopy = Uint8Array.prototype.slice;
const entities = [];

export default function server(map: Board, tick: number) {
    const movesToProcess: Uint8Array[] = [];
    const movement = serverMovementSystem(map);

    events.on(evt => {
        switch (evt.type) {
            case EventType.WsBinary:
                if (evt.data[0] === FrameType.UpdatePosition) {
                    movesToProcess.push(sliceCopy.call(evt.data, 1));
                }
                if (evt.data[0] === FrameType.CreateEntity) {
                    const buf = evt.data as Buffer;
                    const data = readCreateEntity(buf);

                    // TODO: character symbols???
                    // TODO: Updating everyone else on entities.
                    // TODO: Validate that the entities id is actually an id
                    // within their range.
                    const position = new PositionComponent('x', data.x, data.y);
                    const movement = new MovementComponent(0, 0);

                    store.setNewEntity(data.entityId);
                    store.attachComponent(data.entityId, position);
                    store.attachComponent(data.entityId, movement);
                    entities.push(data.entityId);
                }
                break;
        }
    });

    function update() {
        const now = Date.now();

        // Process all movements.
        // TODO: Server Movements System?
        movement.run({
            type: EventType.ServerMovement,
            data: movesToProcess.map(x => Buffer.from(x)),
        });

        setTimeout(update, getNextLoop(tick, Date.now() - now));

        movesToProcess.length = 0;
    }

    update();
};


