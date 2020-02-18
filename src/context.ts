import Player from './objects/player';
import {EntityStore} from './entities';
import {Events} from './events';
import ClientSocket from './client-socket';

type ScreenType = "board" | "input" | "main-menu";

export type GlobalContext = {
    display: {
        width: number;
        height: number;
    };
};

export type LocalContext = {
    screen: ScreenType;
    player: Player;
    store: EntityStore;
    events: Events;
    socket: ClientSocket;
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
    return {
        screen,
        player,
        socket,
        events,
        store,
        id: contextId++,
    } as LocalContext;
}

export default {
    display: {
        width: 80,
        height: 24,
    },
} as GlobalContext;

