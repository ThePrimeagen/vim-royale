import getEvents, {EventTypes} from '../events';
import { MessageType } from './messages';

const events = getEvents();

function getNextLoop(tick: number, timeTaken: number) {
    // TODO: This is really bad to have happen.p..
    if (timeTaken >= tick) {
        return 0;
    }

    return tick - timeTaken;
}

const sliceCopy = Uint8Array.prototype.slice;

export default function server(tick: number) {
    const movesToProcess = [];

    events.on(evt => {
        switch (evt.type) {
            case EventTypes.WsBinary:
                if (evt.data[0] === MessageType.Position) {
                    movesToProcess.push(sliceCopy.call(evt.data, 1));
                }
                break;
        }
    });

    function update() {
        const now = Date.now();

        // Process all user movements and send back OKEES!

        setTimeout(update, getNextLoop(tick, Date.now() - now));
    }
};

