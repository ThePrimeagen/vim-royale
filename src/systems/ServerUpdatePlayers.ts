import System from './System';
import GlobalContext, {LocalContext} from '../context';

import getMovement from '../input/getMovement';
import PC from '../objects/components/position';
import createGameUpdate from '../server/messages/game-state-update';
import { TrackingInfo } from '../types';
import Board from '../board';

export default class ServerUpdatePlayers {
    private board: Board;
    private context: LocalContext;

    constructor(board: Board, context: LocalContext) {
        this.board = board;
        this.context = context;
    }

    run(listOfTrackingInfos: TrackingInfo[]) {
        this.context.store.forEach(PC, (entityId, component: PC) => {

            const obj = {
                entityId,
                // TODO: If we scale everything this will have to be rethought of
                char: component.char[0][0],
                x: component.x,
                y: component.y,
            };

            listOfTrackingInfos.forEach(tracking => {
                if (entityId >= tracking.entityIdRange[0] &&
                    entityId < tracking.entityIdRange[1]) {
                    return;
                }

                // TODO: Make sure that all this object creation does not F me.
                tracking.ws.send(createGameUpdate.playerMovement(obj));
            });
        });
    }
}


