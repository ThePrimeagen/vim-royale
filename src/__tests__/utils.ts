import * as blessed from 'blessed';

import Game from '../index';
import {LocalContext, createLocalContext} from '../context';
import Server from '../server';

export function serverIsListening(server: Server) {
    return new Promise(function(res) {
        server.onListening(res);
    });
}

export function gameIsConnected(game: Game) {
    return new Promise(function(res) {
        // TODO: I HATE THE NAME OF THIS FUNCTION.
        game.onConnected(res);
    });
}

export function gameIsReadyToPlay(game: Game) {
    return new Promise(function(res) {
        // TODO: I HATE THE NAME OF THIS FUNCTION.
        game.onGameStart(res);
    });
}

const keypress = ["onkeypress"];
export type AlmostBlessedKeyEvent = {
    ctrl: boolean,
    name: string,
};
export type KeyListener = [string[], (ch: string, key: AlmostBlessedKeyEvent) => void];
export function createScreen(keyListeners: KeyListener[] = []) {
    // @ts-ignore
    return {
        append: function() {},
        render: function() {},
        key: function(keys: string[], callback: (ch: string) => void) {
            keyListeners.push([keys, callback]);
        },
        on: jest.fn((_: string, callback: (ch: string) => void) => {
            keyListeners.push([keypress, callback]);
        }),
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


