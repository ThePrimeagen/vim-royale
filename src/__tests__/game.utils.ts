import blessed from 'blessed';

import { LocalContext, createLocalContext } from '../context';
import { TrackingInfo } from '../types';
import { EventType } from '../events';
import Game from '../';
import GameController from '../game-controller';

export function createGameWithContext(port: number, screen: any, context: LocalContext) {
    const g = new Game(screen, {
        port,
        host: 'localhost',
        context,
        tick: +process.env.TICK
    });
    return g;
}

// TODO: This makes me sad
export function createGame(port: number, screen: any, {
    tick = +process.env.TICK
} = {}, context: LocalContext = createLocalContext()): Game {

    const g = new Game(screen, {
        port,
        host: 'localhost',
        context,
        tick
    });
    return g;
}

export function gameHasStarted(game: Game) {
    return new Promise(function(res) {
        // TODO: I HATE THE NAME OF THIS FUNCTION.
        game.onGameStart(res);
    });
}

export function gameIsConnected(game: Game) {
    return new Promise(function(res) {
        // TODO: I HATE THE NAME OF THIS FUNCTION.
        game.onConnected(res);
    });
}

export type AlmostBlessedKeyEvent = {
    ctrl: boolean,
    name: string,
};
export type KeyListener = [string[], (ch: string, key: AlmostBlessedKeyEvent) => void];

const keypress = ["onkeypress"];
export function createScreen(keyListeners: KeyListener[] = []) {
    // @ts-ignore
    return {
        append: function() {},
        render: function() {},
        key: function(keys: string[], callback: (ch: string) => void) {
            keyListeners.push([keys, callback]);
        },
        on: (_: string, callback: (ch: string) => void) => {
            keyListeners.push([keypress, callback]);
        },
    } as blessed.Widgets.Screen;
}


export function findMovementListener(listeners: KeyListener[]): KeyListener {
    return listeners.filter(listener => {
        return ~listener[0].indexOf('onkeypress');
    })[0];
}

export function toBlessedKeyEvent(k: string, ctrl: boolean = false): AlmostBlessedKeyEvent {
    return {
        ctrl,
        name: k,
    };
};

export function getMovementFromDir(dir: 'x' | 'y', value: -1 | 1): AlmostBlessedKeyEvent {
    if (dir === 'x') {
        return toBlessedKeyEvent(value === 1 ? 'l' : 'h');
    }
    return toBlessedKeyEvent(value === 1 ? 'j' : 'k');
}

export function getNextWSMessage(info: TrackingInfo | Game): Promise<Buffer> {

    if (info instanceof Game) {
        return new Promise(res => {
            function on(data: any) {
                if (data.type === EventType.WsBinary) {
                    // @ts-ignore -- WHY DO WE HAVE TO DO THIS??
                    info.context.events.off(on);
                    res(data);
                }
            }
            info.context.events.on(on);
        });
    }

    return new Promise(res => {
        function on(data: any) {
            // @ts-ignore
            info.ws.off("message", on);
            res(data);
        }
        info.ws.on("message", on);
    });
}

export async function initializeGame(port: number, tick: number): Promise<[Game, GameController]> {
    const screen = createScreen();
    const game = createGame(port, screen, {tick});
    await gameHasStarted(game);

    return [
        game,
        new GameController(game)
    ];
}

