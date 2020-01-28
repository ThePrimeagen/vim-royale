import * as blessed from 'blessed';
import getEvent, {EventType} from '../events';
import GlobalContext from '../context';

import board from './board';

const events = getEvent();

type InputMap = {
    [key: string]: (ch: string) => boolean;
};

const inputMap: InputMap = {
    board
};

export default function captureInput(screen: blessed.Widgets.Screen) {

    // Quit on Escape, q, or Control-C.
    screen.key(['escape', 'q', 'C-c'], function(ch, key) {
        return process.exit(0);
    });

    screen.key(['h', 'j', 'k', 'l'], function(ch, key) {
        const inputFn = inputMap[GlobalContext.screen];
        if (inputFn && inputFn(ch)) {
            events.emit({
                type: EventType.Run
            });
        }
    });
};
