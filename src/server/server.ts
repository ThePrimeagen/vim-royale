import { getEntityIdFromBuffer, isUpdateEveryoneEntity } from '../objects';
import Player from '../objects/player';
import getEvents, {Events, EventType, MovesToProcess} from '../events';
import {FrameType} from './messages/types';
import {readCreateEntity} from './messages/createEntity';
import {readUpdatePosition} from './messages/updatePosition';
import createGameStateUpdate from './messages/game-state-update';
import PositionComponent from '../objects/components/position';
import MovementComponent from '../objects/components/movement';
import ServerMovementSystem from '../systems/ServerMovementSystem';
import LifetimeSystem from '../systems/LifetimeSystem';
import CreateEntitySystem from '../systems/ServerCreateEntitySystem';
import VelocitySystem from '../systems/VelocitySystem';
import ServerUpdatePlayers from '../systems/ServerUpdatePlayers';
import GlobalContext, {createLocalContext, LocalContext} from '../context';
import Board from '../board';
import getStore from '../entities';
import {TrackingInfo} from '../types';
import getLogger from '../logger';
import ObjectPool from '../util/SyncObjectPool';
import getNextLoop from '../util/getNextLoop';

const logger = getLogger("Server");
const sliceCopy = Uint8Array.prototype.slice;
const pool = new ObjectPool();

//
//TODO: Refactor this into a less heaping pile of shit.

export default class ServerClientSync {
    private loopLastCalled: number;
    private infos: TrackingInfo[];
    private movesToProcess: MovesToProcess[];
    private tick: number;
    private map: Board;
    private entities: number[];
    private boundUpdate: () => void;
    private lifetime: LifetimeSystem;
    private velocity: VelocitySystem;
    private createEntity: CreateEntitySystem;
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
        this.lifetime = new LifetimeSystem(context);
        this.createEntity = new CreateEntitySystem(context);
        this.velocity = new VelocitySystem(context);
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

                    logger("Server Binary Event", evt.data[0]);

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
                        const buf = evt.data;
                        const entityId = readCreateEntity(this.context, buf, 1);

                        // @ts-ignore
                        const pos = this.context.store.
                            getComponent(entityId, PositionComponent) as PositionComponent;

                        if (Player.is(buf, 1) &&
                            !GlobalContext.activePlayers[entityId]) {
                            GlobalContext.activePlayers[entityId] = pos;
                        }

                        // TODO: Do i even need this.?
                        this.entities.push(entityId);
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
        const diff = this.loopLastCalled === 0 ? 0 : then - this.loopLastCalled;
        this.loopLastCalled = then;

        // Process all movements.
        // TODO: Server Movements System?
        this.createEntity.run(this.infos);
        const movements = this.velocity.run(diff);
        this.movement.run(this.movesToProcess, movements);
        this.updatePlayers.run(this.infos);
        this.lifetime.run(diff);

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
            if (!process.env.NO_GC) {
                global.gc();
            }
            const gDiff = Date.now() - gThen;

            gSum += gDiff;
            if (gHigh < gDiff) {
                gHigh = gDiff;
            }

            if (gLow > gDiff) {
                gLow = gDiff;
            }
        }

        const frameTimeDiff = Date.now() - then;
        sum += frameTimeDiff;
        if (high < frameTimeDiff) {
            high = frameTimeDiff;
        }

        if (low > frameTimeDiff) {
            low = frameTimeDiff;
        }

        if (count === 500) {
            console.log("Stats", high, low, sum / count);
            console.log("Garbage", gHigh, gLow, gSum / gCount);
            console.log("Entities", this.context.store.getAllEntities().length);
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

