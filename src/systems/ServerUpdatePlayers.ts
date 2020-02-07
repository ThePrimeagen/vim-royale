import System from './System';
import GlobalContext from '../context';

import getEntityStore from '../entities';
import getMovement from '../input/getMovement';
import PC from '../objects/components/position';
import createGameUpdate from '../server/messages/game-state-update';
import { TrackingInfo } from '../types';
import Board from '../board';

const store = getEntityStore();

export default class ServerUpdatePlayers {
    private board: Board;

    constructor(board: Board) {
        this.board = board;
    }

    run(listOfTrackingInfos: TrackingInfo[]) {
        store.forEach(PC, (entityId, component: PC) => {

            const obj = {
                entityId,
                // TODO: If we scale everything this will have to be rethought of
                char: component.char[0][0],
                x: component.x,
                y: component.y,
            };

            listOfTrackingInfos.forEach(tracking => {
                if (entityId >= tracking.entityIdRange[0] &&
                    entityId <= tracking.entityIdRange[1]) {
                    return;
                }

                // TODO: Make sure that all this object creation does not F me.
                tracking.ws.send(createGameUpdate.playerMovement(obj));
            });
        });
    }
}


