import getEvents, {EventType} from '../events';
import { FrameType } from './messages/types';
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

export default function server(map: Board, tick: number) {
    const movesToProcess = [];

    events.on(evt => {
        switch (evt.type) {
            case EventType.WsBinary:
                if (evt.data[0] === FrameType.UpdatePosition) {
                    movesToProcess.push(sliceCopy.call(evt.data, 1));
                }
                if (evt.data[0] === FrameType.CreateEntity) {
                    const
                    store.attachComponent
                }
                break;
        }
    });

    function update() {
        const now = Date.now();

        // Process all movements.
        // TODO: Server Movements System?
        movesToProcess.forEach(x => {
            console.log(x);
        });

        movesToProcess.length = 0;

        setTimeout(update, getNextLoop(tick, Date.now() - now));
    }

    update();
};

