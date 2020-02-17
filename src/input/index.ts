import * as blessed from 'blessed';
import {EventType} from '../events';
import GlobalContext, {LocalContext} from '../context';

import board from './board';

type InputMap = {
    [key: string]: (ch: string, context: LocalContext) => boolean;
};

const inputMap: InputMap = {
    board
};

export default function captureInput(screen: blessed.Widgets.Screen, context: LocalContext) {

    // Quit on Escape, q, or Control-C.
    screen.key(['escape', 'q', 'C-c'], function(ch, key) {
        return process.exit(0);
    });

    screen.key(['h', 'j', 'k', 'l'], function(ch, key) {
        const inputFn = inputMap[context.screen];
        if (inputFn && inputFn(ch, context)) {
            context.events.emit({
                type: EventType.Run
            });
        }
    });
};
