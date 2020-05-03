import dotenv from 'dotenv';
dotenv.config();

process.env.RENDER = 'false';
process.env.LOGGER_TYPE = 'log';
process.env.SUPPRESS_LOGS = 'true';

import {createLocalContext} from './context';
import Server from './server';
import {
    serverIsListening ,
} from './__tests__/server.utils';

import {
    createScreen,
    createGameWithContext,
    gameHasStarted,
    findMovementListener,
} from './__tests__/game.utils';

import createInput from './input';

const playerUpdateTime = +process.env.PLAYER_UPDATE_TIME || 300;
const directions = [ 'j', 'h', 'l', 'k', ];
const port = 1337;

function getNextPlayerUpdateTime() {
    const halfTime = playerUpdateTime / 2;
    return (halfTime + Math.random() * playerUpdateTime) | 0;
}

async function run() {

    if (process.env.SERVER === 'true') {
        const server = new Server({
            port,
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
        const g = createGameWithContext(port, screen, context);
        createInput(screen, context);

        return {
            context,
            g,
            listeners,
            moveIdx: 0,
        };
    });

    await Promise.all(players.map(p => gameHasStarted(p.g)));

    players.forEach(p => {
        runIndefinitely(p, findMovementListener(p.listeners));
    });
}

function runIndefinitely(player, listener) {
    setTimeout(() => {
        listener[1](null, {
            name: directions[player.moveIdx++ % 4]
        });
        runIndefinitely(player, listener);
    }, getNextPlayerUpdateTime());
}

run();

