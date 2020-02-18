import * as blessed from 'blessed';
import System from '../systems/System';
import GlobalContext, {LocalContext} from '../context';
import {EventData, EventType} from '../events';
import createLogger from '../logger';
import {StartGameMessage} from '../server/commands';
import {isStatusCommand, isMapCommand, WSMessage} from '../server/commands';

enum State {
    Connecting,
    Menu,
};

const logger = createLogger("mainMenu");

export default function mainMenu(screen: blessed.Widgets.Screen, context: LocalContext) {
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
        logger("onEvent", context.id, evt.type);

        switch(evt.type) {
            case EventType.WsOpen:
                box.setContent("Connected... Getting game board.");
                break;

            case EventType.WsMessage: {
                const d = evt.data as WSMessage;
                if (isMapCommand(d)) {
                    context.events.off(onEvent);
                    context.events.emit({
                        type: EventType.StartGame,
                        data: d as StartGameMessage,
                    });
                }

                break;
            }
        }
    };

    context.events.on(onEvent);
};


