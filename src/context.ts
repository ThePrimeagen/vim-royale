import Player from './objects/player';
import PositionComponent from './objects/components/position';
import {EntityStore} from './entities';
import {Events, EventType} from './events';
import ClientSocket from './client-socket';

export enum ScreenType {
    Normal = "NORMAL",
    Insert = "INSERT",
    MainMenu = "MAIN-MENU",
};

export type GlobalContext = {
    display: {
        width: number;
        height: number;
    };
    activePlayers: {
        [key: string]: PositionComponent,
    };
};

export type LocalContext = {
    screen: ScreenType;
    player: Player;
    store: EntityStore;
    events: Events;
    socket: ClientSocket;
    dirty: boolean;
    id: number;
};

let contextId = 0;
export function createLocalContext({
    screen,
    store,
    events,
    player,
    socket,
}: {
    screen?: ScreenType,
    store?: EntityStore,
    events?: Events,
    player?: Player,
    socket?: ClientSocket
} = {}): LocalContext {
    const out = {
        get screen() {
            return screen;
        },
        set screen(s: ScreenType) {
            screen = s;
            if (out.events) {
                out.events.emit({
                    type: EventType.ScreenTypeChanged
                });
            }
        },
        player,
        socket,
        events,
        store,
        dirty: true,
        id: contextId++,
    } as LocalContext;

    return out;
}

export default {
    display: {
        width: 80,
        height: 24,
    },
    activePlayers: {}
} as GlobalContext;

