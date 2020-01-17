import * as blessed from 'blessed';
import getEvent from '../events';
import GlobalContext from '../context';

import board from './board';

const events = getEvent();
const inputMap = {
    board
};

export default function captureInput(screen: blessed.Widgets.Screen) {

    // Quit on Escape, q, or Control-C.
    screen.key(['escape', 'q', 'C-c'], function(ch, key) {
        return process.exit(0);
    });

    screen.key(['h', 'j', 'k', 'l'], function(ch, key) {
        const inputFn = inputMap[GlobalContext.screen];
        debugger;
        if (inputFn && inputFn(ch)) {
            console.error("Emitting Event run");
            events.emit({
                type: 'run',
                data: {}
            });
        }
    });
};
