import * as blessed from 'blessed';
import System from '../systems/System';
import GlobalContext from '../context';
import getEvents, {EventData} from '../events';
import { MapMessage } from '../server/commands';
import { isStatusCommand, isMapCommand, WSMessage } from '../server/commands';

enum State {
    Connecting,
    Menu,
};

const events = getEvents();
export default function mainMenu(systems: System[], screen: blessed.Widgets.Screen) {
    systems.length = 0;

    let state = State.Connecting;

    const box = blessed.box({
        top: 0,
        left: 0,
        width: GlobalContext.display.width + 2,
        height: GlobalContext.display.height + 2,

        content: "Loading...",
        tags: true,
        border: {
            type: 'bg'
        },
    });

    screen.append(box);
    screen.render();

    // Wait for tit to go to connected state.
    function onEvent(evt: EventData) {
        switch(evt.type) {
            case 'ws-open':
                console.error('ws-open');
                box.setContent("Connected... Getting game board.");
                break;

            case 'ws-message': {
                const d = evt.data as WSMessage;
                if (isMapCommand(d)) {
                    events.off(onEvent);
                    events.emit({
                        type: 'start-game',
                        data: d as MapMessage,
                    });
                }

                break;
            }
        }
    };

    getEvents().on(onEvent);
};


