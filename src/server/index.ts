import * as dotenv from 'dotenv';
dotenv.config();

import WebSocket from 'ws';

import Board from '../board';
import Stats from '../stats';

import createServer from './server';
import getEvents, {BinaryData, EventType} from '../events';
import {TrackingInfo} from '../types';

export type ServerConfig = {
    port: number,
    width: number,
    height: number,
    tick: number,
    entityIdRange: number,
}

const events = getEvents();

export default class Server {
    private currentPlayers: TrackingInfo[];
    private callbacks: {
        listening: (() => void)[]
    };

    private entityId: number;
    private wss: WebSocket.Server;
    private map: Board;
    private width: number;
    private height: number;
    private entitiesRange: number;
    private entitiesStart: number;

    constructor({
        port,
        width,
        height,
        tick,
        entityIdRange = 10000,
    }: ServerConfig) {
        this.callbacks = {
            listening: []
        };

        this.currentPlayers = [];
        this.entityId = 0;
        this.map = Board.generate(width, height);
        this.width = width;
        this.height = height;
        this.entitiesRange = entityIdRange;
        this.entitiesStart = 0;

        this.wss = new WebSocket.Server({
            port
        });

        //
        //TODO: Server refactor should make an object to directly call
        //functions on instead of this event bus non-sense.  I hates it.
        createServer(this.map, tick, this.currentPlayers);

        this.wss.on('listening', () => {
            this.callbacks.listening.forEach(cb => cb());
        });

        this.wss.on('connection', ws => {
            const binaryMessage = {
                type: 'ws-binary',
                data: Buffer.alloc(1)
            } as BinaryData;

            // TODO: on the edities
            const entityIdRange: [number, number] =
                [this.entitiesStart, this.entitiesStart + this.entitiesRange];

            this.entitiesStart += this.entitiesRange;

            const trackingInfo: TrackingInfo = {
                ws,
                stats: new Stats(),
                entityIdRange,
                movementId: 0,
            };
            this.currentPlayers.push(trackingInfo);

            // TODO: Wrap this socket in something to control for types
            // we want to send down the current state to the user.
            // TODO: Fix this shotty startup sequence
            ws.send(JSON.stringify({ status: 'ready', encoding: 'json' }));

            ws.send(JSON.stringify({
                type: 'map',
                map: this.map,
                position: this.pickRandoPosition(),
                entityIdRange,
            }));

            ws.on('close', () => {
                const idx = this.currentPlayers.indexOf(trackingInfo);
                this.currentPlayers.splice(idx, 1);

                events.emit({
                    type: EventType.WsClose,
                    data: trackingInfo
                });
            });

            // Wait for request to join game...
            // TODO: This is where the board needs to be played.
            ws.on('message', msg => {
                if (msg instanceof Uint8Array) {
                    binaryMessage.data = msg;
                    events.emit(binaryMessage, trackingInfo);
                    return;
                }
            });
        });
    }

    public pickRandoPosition(): [number, number] {
        return [
            Math.floor(Math.random() * this.width - 2) + 1,
            Math.floor(Math.random() * this.height - 2) + 1
        ];
    }

    public onListening(cb: () => void) {
        this.callbacks.listening.push(cb);
    }

    public shutdown() {
        this.wss.close();
        this.callbacks = null;
    }
}

if (require.main === module) {
    // then start server.
    new Server({
        port: +process.env.PORT,
        width: +process.env.WIDTH,
        height: +process.env.HEIGHT,
        tick: +process.env.TICK,
        entityIdRange: +process.env.ENTITY_ID_RANGE,
    });
}



