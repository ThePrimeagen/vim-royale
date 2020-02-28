import dotenv from 'dotenv';
dotenv.config();

process.env.RENDER = 'false';
process.env.LOGGER_TYPE = 'log';
process.env.SUPPRESS_LOGS = 'true';

import * as blessed from 'blessed';

import {LocalContext, createLocalContext} from './context';
import Game from './index';
import Server from './server';
import {EventType} from './events';
import {EntityStore} from './entities';
import {FrameType} from './server/messages/types';
import {
    gameIsConnected,
    gameIsReadyToPlay,
    serverIsListening,
    KeyListener,
    createScreen,
    findMovementListener,
} from './__tests__/utils';
import createInput from './input';
import PositionComponent from './objects/components/position';

const playerUpdateTime = +process.env.PLAYER_UPDATE_TIME || 300;
const directions = [ 'j', 'h', 'l', 'k', ];

function getNextPlayerUpdateTime() {
    const halfTime = playerUpdateTime / 2;
    return (halfTime + Math.random() * playerUpdateTime) | 0;
}

function createGame(screen: blessed.Widgets.Screen, context: LocalContext = createLocalContext(), port: number = 1337): Game {
    const g = new Game(screen, {
        port,
        host: 'localhost',
        context,
    });
    return g;
}

async function run() {

    if (process.env.SERVER === 'true') {
        const server = new Server({
            port: 1337,
            width: 1000,
            height: 1000,
            tick: +process.env.TICK,
            entityIdRange: 1337,
        });

        await serverIsListening(server);
        return;
    }

    const playerCount = +process.env.PLAYER_COUNT || 100
    const players = new Array(playerCount).fill(0).map(() => {
        const listeners = [];
        const screen = createScreen(listeners);
        const context = createLocalContext();
        const g = createGame(screen, context);
        createInput(screen, context);

        return {
            context,
            g,
            listeners,
            moveIdx: 0,
        };
    });

    await Promise.all(players.map(p => gameIsReadyToPlay(p.g)));

    players.forEach(p => {
        runIndefinitely(p, findMovementListener(p.listeners));
    });
}

function runIndefinitely(player, listener) {
    setTimeout(() => {
        listener[1](directions[player.moveIdx++ % 4]);
        runIndefinitely(player, listener);
    }, getNextPlayerUpdateTime());
}

run();

