import getEvents, {Events, EventType, MovesToProcess} from '../events';
import {FrameType} from './messages/types';
import {readCreateEntity} from './messages/createEntity';
import {readUpdatePosition} from './messages/updatePosition';
import createGameStateUpdate from './messages/game-state-update';
import PositionComponent from '../objects/components/position';
import MovementComponent from '../objects/components/movement';
import ServerMovementSystem from '../systems/ServerMovementSystem';
import ServerUpdatePlayers from '../systems/ServerUpdatePlayers';
import {createLocalContext, LocalContext} from '../context';
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

//
//TODO: Refactor this into a less heaping pile of shit.

export default class ServerClientSync {
    private infos: TrackingInfo[];
    private movesToProcess: MovesToProcess[];
    private tick: number;
    private map: Board;
    private entities: number[];
    private boundUpdate: () => void;
    private movement: ServerMovementSystem;
    private updatePlayers: ServerUpdatePlayers;

    public context: LocalContext;

    constructor(map: Board, tick: number, infos: TrackingInfo[], context: LocalContext) {
        logger("Constructing new ServerClientSync");
        this.map = map;
        this.tick = tick;
        this.infos = infos;
        this.movesToProcess = [];
        this.entities = [];

        this.context = context;
        this.context.events = getEvents();
        this.context.store = getStore();

        this.movement = new ServerMovementSystem(this.map, this.context);
        this.updatePlayers = new ServerUpdatePlayers(this.map, this.context);
        this.boundUpdate = this.update.bind(this);

        this.initializeEvents();
        this.update();
    }

    private initializeEvents() {
        this.context.events.on((evt, ...args) => {
            logger("Server Event", evt.type);

            switch (evt.type) {
                case EventType.WsBinary:
                    const trackingInfo: TrackingInfo = args[0];

                    if (evt.data[0] === FrameType.UpdatePosition) {
                        this.movesToProcess.push({
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

                        this.context.store.setNewEntity(data.entityId);
                        this.context.store.attachComponent(data.entityId, position);
                        this.context.store.attachComponent(data.entityId, movement);
                        this.entities.push(data.entityId);
                    }
                    break;

                case EventType.WsClose: {
                    const trackingInfo: TrackingInfo = evt.data;
                    const buf = createGameStateUpdate.
                        removeEntityRange(trackingInfo.entityIdRange);

                    this.context.store.removeEntityRange(...trackingInfo.entityIdRange);
                    this.infos.forEach(tracking => {
                        tracking.ws.send(buf);
                    });
                    break;
                }
            }
        });
    }

    public update() {
        const then = Date.now();

        // Process all movements.
        // TODO: Server Movements System?
        this.movement.run({
            type: EventType.ServerMovement,
            data: this.movesToProcess,
        });

        this.updatePlayers.run(this.infos);

        setTimeout(this.boundUpdate, getNextLoop(this.tick, Date.now() - then));

        console.log("Render Time.", Date.now() - then, this.movesToProcess.length);
        this.movesToProcess.length = 0;
        global.gc();
    }
}

