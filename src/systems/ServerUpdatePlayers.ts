import GlobalContext, {LocalContext} from '../context';

import PC from '../objects/components/position';
import NSC from '../objects/components/network-sync';
import createGameUpdate from '../server/messages/game-state-update';
import {ArrayPool, createBufferWriterPool} from '../util/pool';
import {TrackingInfo} from '../types';
import Board from '../board';
import getLogger from '../logger';

const logger = getLogger("ServerUpdatePlayers");
const bufferPool = createBufferWriterPool(50);

const obj = {
    entityId: 0,
    // TODO: If we scale everything this will have to be rethought of
    char: 'x',
    x: 0,
    y: 0,
};

const { width, height } = GlobalContext.display;
function isWithinUpdateDistance(a: PC, b: PC): boolean {
    return Math.abs(a.x - b.x) < width &&
        Math.abs(a.y - b.y) < height;
}

type TickCallback = {
    postTickCallback(cb: () => void);
};

export default class ServerUpdatePlayers {
    private context: LocalContext;

    // TODO: Measure?
    private updateMap: Map<TrackingInfo, Map<TrackingInfo, number>>

    // Probably should type this?
    // TODO: Type thsi
    private wsMessages: Array<[TrackingInfo, Buffer, () => void]>;

    constructor(server: TickCallback, context: LocalContext) {
        this.updateMap = new Map();
        this.wsMessages = [];
        this.context = context;

        const self = this;
        // TODO: Type check this at some point you goon.
        server.postTickCallback(function onTickCallback() {
            for (let i = 0; i < self.wsMessages.length; ++i) {
                const msg = self.wsMessages[i];

                msg[0].ws.send(msg[1], msg[2]);
                ArrayPool.free(msg);
            }

            self.wsMessages.length = 0;
        });
    }

    // TODO: 1, stop updating the player with the same message over and over again.
    //   ->> Player0 -> Player1
    //   ->> Player0 -> Player2
    // TODO: 2, Quad tree?
    run(listOfTrackingInfos: TrackingInfo[]) {
        const entities = this.context.store.getComponents(NSC);

        if (!entities) {
            return;
        }

        for (const [entityId, component] of entities) {
            const pos = this.context.store.getComponent<PC>(entityId, PC);

            obj.entityId = entityId;
            obj.char = pos.char[0][0];
            obj.x = pos.x;
            obj.y = pos.y;

            for (let i = 0; i < listOfTrackingInfos.length; ++i) {
                const tracking = listOfTrackingInfos[i];
                const playerEntityId = tracking.entityIdRange[0];

                if (entityId >= playerEntityId &&
                    entityId < tracking.entityIdRange[1]) {
                    continue;
                }

                let main: PC;
                if (process.env.MAP === 'true') {
                    main = GlobalContext.activePlayers[playerEntityId];
                } else {
                    main = this.context.store.getComponent<PC>(playerEntityId, PC);
                }

                if (!main) {
                    // this does happen when the player has yet to upload their
                    // before another player has sent an update...
                    continue;
                }

                // This... This is naughty...  Not all things should be
                // updated.  Specifically when it comes to bullets.  Just
                // because i am dressed this way, does not mean, your buffer
                // can hold my ascii
                if (isWithinUpdateDistance(main, pos)) {
                    const buf = bufferPool.get();
                    const playerData = createGameUpdate.
                        entityPositionUpdate(obj, buf.item);

                    const item = ArrayPool.malloc();

                    item.push(tracking);
                    item.push(playerData);
                    item.push(buf.free);

                    // Why cannot this work? I IS CONFUSED...
                    // @ts-ignore
                    this.wsMessages.push(item);
                }
            };
        }
    }
}
