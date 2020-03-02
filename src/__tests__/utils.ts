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

export type KeyListener = [string[], (ch: string) => void];
export function createScreen(keyListeners: KeyListener[] = []) {
    // @ts-ignore
    return {
        append: function() {},
        render: function() {},
        key: function(keys: string[], callback: (ch: string) => void) {
            keyListeners.push([keys, callback]);
        },
    } as blessed.Widgets.Screen;
}

export function findMovementListener(listeners: KeyListener[]): KeyListener {
    return listeners.filter(listener => ~listener[0].indexOf('j'))[0];
}

export function getMovementFromDir(dir: 'x' | 'y', value: -1 | 1): string {
    if (dir === 'x') {
        return value === 1 ? 'l' : 'h';
    }
    return value === 1 ? 'j' : 'k';
}


