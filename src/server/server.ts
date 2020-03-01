import getEvents, {Events, EventType, MovesToProcess} from '../events';
import {FrameType} from './messages/types';
import {readCreateEntity} from './messages/createEntity';
import {readUpdatePosition} from './messages/updatePosition';
import createGameStateUpdate from './messages/game-state-update';
import PositionComponent from '../objects/components/position';
import MovementComponent from '../objects/components/movement';
import ServerMovementSystem from '../systems/ServerMovementSystem';
import ServerUpdatePlayers from '../systems/ServerUpdatePlayers';
import GlobalContext, {createLocalContext, LocalContext} from '../context';
import Board from '../board';
import getStore from '../entities';
import {TrackingInfo} from '../types';
import getLogger from '../logger';
import ObjectPool from '../util/SyncObjectPool';

const logger = getLogger("Server");

function getNextLoop(tick: number, timeTaken: number) {
    // TODO: This is really bad to have happen.p..
    if (timeTaken >= tick) {
        return 0;
    }

    return tick - timeTaken;
}

const sliceCopy = Uint8Array.prototype.slice;
const pool = new ObjectPool();

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
    private updateObject: {type: EventType.ServerMovement, data: MovesToProcess[]};

    public context: LocalContext;

    constructor(map: Board, tick: number, infos: TrackingInfo[], context: LocalContext) {
        logger("Constructing new ServerClientSync");
        this.map = map;
        this.tick = tick;
        this.infos = infos;
        this.movesToProcess = [];
        this.entities = [];
        this.updateObject = {
            type: EventType.ServerMovement,
            data: this.movesToProcess,
        };

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
                        // 3 Shape -- One time cost
                        // 2 Strings
                        // buf, tracking
                        //
                        // 1 Object
                        // 2 Buffer
                        // TODO: Garbage
                        const obj = pool.malloc();
                        obj.buf = Buffer.from(evt.data);
                        obj.tracking = trackingInfo;
                        this.movesToProcess.push(obj as MovesToProcess);
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

                        if (!GlobalContext.activePlayers[data.entityId]) {
                            GlobalContext.activePlayers[data.entityId] = position;
                        }

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
        this.movement.run(this.updateObject);
        this.updatePlayers.run(this.infos);

        const now = Date.now();
        if (this.tick < now - then) {
            //console.log("GET IT TOGETHER");
        }

        setTimeout(this.boundUpdate, getNextLoop(this.tick, now - then));

        //console.log("Render Time.", Date.now() - then);
        for (let i = 0; i < this.movesToProcess.length; ++i) {
            pool.free(this.movesToProcess[i]);
        }

        this.movesToProcess.length = 0;

        if (++count % 10 === 0) {
            gCount++
            const gThen = Date.now();
            global.gc();
            const gDiff = Date.now() - gThen;

            gSum += gDiff;
            if (gHigh < gDiff) {
                gHigh = gDiff;
            }

            if (gLow > gDiff) {
                gLow = gDiff;
            }
        }


        const diff = Date.now() - then;
        sum += diff;
        if (high < diff) {
            high = diff;
        }

        if (low > diff) {
            low = diff;
        }

        if (count === 500) {
            console.log("Stats", high, low, sum / count);
            console.log("Garbage", gHigh, gLow, gSum / gCount);
            sum = gCount = count = high = 0
            gSum = gHigh = 0
            gLow = low = 1000;
        }
    }
}

let gHigh = 0;
let gLow = 0;
let gSum = 0;
let count = 0;
let gCount = 0;
let high = 0;
let low = 1000;
let sum = 0;

