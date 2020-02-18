import getEvents, {Events, EventType, MovesToProcess} from '../events';
import {FrameType} from './messages/types';
import {readCreateEntity} from './messages/createEntity';
import {readUpdatePosition} from './messages/updatePosition';
import createGameStateUpdate from './messages/game-state-update';
import PositionComponent from '../objects/components/position';
import MovementComponent from '../objects/components/movement';
import ServerMovementSystem from '../systems/ServerMovementSystem';
import ServerUpdatePlayers from '../systems/ServerUpdatePlayers';
import {createLocalContext} from '../context';
import Board from '../board';
import getStore from '../entities';
import {TrackingInfo} from '../types';
import getLogger from '../logger';

const logger = getLogger("Server");

function getNextLoop(tick: number, timeTaken: number) {
    // TODO: This is really bad to have happen.p..
    if (timeTaken >= tick) {
        return 0;
    }

    return tick - timeTaken;
}

const sliceCopy = Uint8Array.prototype.slice;
const entities = [];

//
//TODO: Refactor this into a less heaping pile of shit.
export default function server(map: Board, tick: number, infos: TrackingInfo[]) {
    logger("Starting Server");

    const movesToProcess: MovesToProcess[] = [];
    const context = createLocalContext({
        store: getStore(),
        events: getEvents(),
    });

    const movement = new ServerMovementSystem(map, context);
    const updatePlayers = new ServerUpdatePlayers(map, context);

    context.events.on((evt, ...args) => {

        logger("Server Event", evt.type);

        switch (evt.type) {
            case EventType.WsBinary:
                const trackingInfo: TrackingInfo = args[0];

                if (evt.data[0] === FrameType.UpdatePosition) {
                    movesToProcess.push({
                        buf: Buffer.from(sliceCopy.call(evt.data)),
                        tracking: trackingInfo,
                    });
                }

                if (evt.data[0] === FrameType.CreateEntity) {
                    const buf = evt.data as Buffer;
                    const data = readCreateEntity(buf, 1);

                    // TODO: character symbols???
                    // TODO: Updating everyone else on entities.
                    // TODO: Validate that the entities id is actually an id
                    // within their range.
                    const position = new PositionComponent('x', data.x, data.y);
                    const movement = new MovementComponent(0, 0);

                    context.store.setNewEntity(data.entityId);
                    context.store.attachComponent(data.entityId, position);
                    context.store.attachComponent(data.entityId, movement);
                    entities.push(data.entityId);
                }
                break;

            case EventType.WsClose: {
                const trackingInfo: TrackingInfo = evt.data;
                const buf = createGameStateUpdate.
                    removeEntityRange(trackingInfo.entityIdRange);

                context.store.removeEntityRange(...trackingInfo.entityIdRange);
                infos.forEach(tracking => {
                    tracking.ws.send(buf);
                });
                break;
            }
        }
    });

    function update() {
        const now = Date.now();

        // Process all movements.
        // TODO: Server Movements System?
        movement.run({
            type: EventType.ServerMovement,
            data: movesToProcess,
        });

        updatePlayers.run(infos);

        setTimeout(update, getNextLoop(tick, Date.now() - now));

        movesToProcess.length = 0;
    }

    update();
};

