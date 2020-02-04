import * as dotenv from 'dotenv';
dotenv.config();

import WebSocket from 'ws';

import Board from '../board';
import Stats from '../stats';

import createServer from './server';
import getEvents, {BinaryData} from '../events';
import {TrackingInfo} from '../types';

const wss = new WebSocket.Server({
    // @ts-ignore
    port: +process.env.PORT
});

const currentPlayers = [];
let entityId = 0;

// 0       8       6       4       2
// | EntityID ----||command| -------
// --                              |
const map = Board.generate(500, 500);
function pickRandoPosition() {
    return [
        Math.floor(Math.random() * 498) + 1,
        Math.floor(Math.random() * 498) + 1
    ];
}

const server = createServer(map, 1000);
const events = getEvents();

wss.on('connection', ws => {
    const binaryMessage = {
        type: 'ws-binary',
        data: Buffer.alloc(1)
    } as BinaryData;

    const trackingInfo: TrackingInfo = {
        ws,
        // TODO: Do that
        stats: new Stats(),
    };

    // TODO: on the edities
    const entityIdRange = [1000, 2000];

    console.log("LOOK AT ME, connected");

    // TODO: Wrap this socket in something to control for types
    // we want to send down the current state to the user.
    // TODO: Fix this shotty startup sequence
    ws.send(JSON.stringify({ status: 'ready', encoding: 'json' }));

    // TODO: Pick position?
    ws.send(JSON.stringify({ type: 'map', map, position: pickRandoPosition() }));

    // Wait for request to join game...
    // TODO: This is where the board needs to be played.
    ws.on('message', msg => {
        if (msg instanceof Uint8Array) {
            binaryMessage.data = msg;
            events.emit(binaryMessage, trackingInfo);
            return;
        }

        console.log("What am I doing here?", msg);
    });
});


