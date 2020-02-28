import System from './System';
import GlobalContext, {LocalContext} from '../context';

import getMovement from '../input/getMovement';
import PC from '../objects/components/position';
import createGameUpdate, {PLAYER_MOVEMENT_SIZE} from '../server/messages/game-state-update';
import BufferWriter from '../server/messages/buffer-writer';
import {TrackingInfo} from '../types';
import Board from '../board';

let obj;
if (process.env.CACHE === 'true') {
    obj = {
        entityId: 0,
        // TODO: If we scale everything this will have to be rethought of
        char: 'x',
        x: 0,
        y: 0,
    };
}

class BufferPool {
    private pool: BufferWriterWrapper[];
    private factory: (pool: BufferPool) => BufferWriterWrapper;
    constructor(factory: (pool: BufferPool) => BufferWriterWrapper) {
        this.pool = [];
        this.factory = factory;
    }

    public malloc() {
        if (this.pool.length === 0) {
            this.pool.push(this.factory(this));
        }
        return this.pool.pop();
    }

    public free(buf: BufferWriterWrapper) {
        this.pool.push(buf);
    }
}

class BufferWriterWrapper {
    private pool: BufferPool;

    public detachCallback: () => void;
    public writer: BufferWriter;

    constructor(size: number, pool: BufferPool) {
        this.pool = pool;

        this.writer = new BufferWriter(size);
        this.detachCallback = this.detach.bind(this);
    }

    private detach() {
        this.writer.reset();
        this.pool.free(this);
    }
}

const pool = new BufferPool(function(pool: BufferPool): BufferWriterWrapper {
    return new BufferWriterWrapper(PLAYER_MOVEMENT_SIZE, pool);
});

export default class ServerUpdatePlayers {
    private board: Board;
    private context: LocalContext;

    constructor(board: Board, context: LocalContext) {
        this.board = board;
        this.context = context;
    }

    run(listOfTrackingInfos: TrackingInfo[]) {
        this.context.store.forEach(PC, (entityId, component: PC) => {

            const obj2 = obj || {};
            obj2.entityId = entityId;
            obj2.char = component.char[0][0];
            obj2.x = component.x;
            obj2.y = component.y;

            listOfTrackingInfos.forEach(tracking => {
                if (entityId >= tracking.entityIdRange[0] &&
                    entityId < tracking.entityIdRange[1]) {
                    return;
                }

                const buf = pool.malloc();
                const playerData = createGameUpdate.
                    playerMovement(obj2, buf.writer);

                // TODO: Make sure that all this object creation does not F me.
                tracking.ws.send(playerData, buf.detachCallback);
            });
        });
    }
}


