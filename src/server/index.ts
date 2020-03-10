import * as dotenv from 'dotenv';
dotenv.config();

import WebSocket from 'ws';
import ON_DEATH from 'death';

import Board from '../board';
import Stats from '../stats';

import ServerClientSync from './server';
import getLogger, {flush} from '../logger';
import {Events, BinaryData, EventType} from '../events';
import {TrackingInfo} from '../types';
import {createLocalContext, LocalContext} from '../context';
import {ServerConfig} from './types';

const logger = getLogger("ServerIndex");

let trackingInfoId = 0;
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
    private context: LocalContext;
    private optionalStartingPositions?: [number, number][];
    private optionIdx: number;

    public scs: ServerClientSync;

    constructor(config: ServerConfig) {
        const {
            port,
            width,
            height,
            tick,
            entityIdRange = 10000,
            optionalStartingPositions,
        } = config;

        this.callbacks = {
            listening: []
        };
        this.optionIdx = 0;
        this.optionalStartingPositions = optionalStartingPositions;

        this.currentPlayers = [];
        this.entityId = 0;
        this.map = Board.generate(width, height);
        this.width = width;
        this.height = height;
        this.entitiesRange = entityIdRange;
        this.entitiesStart = 0;
        this.context = createLocalContext();

        this.wss = new WebSocket.Server({
            port
        });

        //
        //TODO: Server refactor should make an object to directly call
        //functions on instead of this event bus non-sense.  I hates it.
        this.scs = new ServerClientSync(
            this.map, tick, this.currentPlayers, this.context);

        this.wss.on('listening', () => {
            this.callbacks.listening.forEach(cb => cb());
        });

        this.wss.on('connection', ws => {
            console.log("New Connection", trackingInfoId);
            logger("New Connection", trackingInfoId);

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
                id: trackingInfoId++,
            };

            this.currentPlayers.push(trackingInfo);

            // TODO: Wrap this socket in something to control for types
            // we want to send down the current state to the user.
            // TODO: Fix this shotty startup sequence
            logger("Sending", trackingInfo.id, JSON.stringify({ status: 'ready', encoding: 'json' }));
            ws.send(JSON.stringify({ status: 'ready', encoding: 'json' }));

            const pos = this.pickPosition();
            logger("Sending", trackingInfo.id, {
                type: 'map',
                map: "big map goes here",
                position: pos,
                entityIdRange,
            });

            ws.send(JSON.stringify({
                type: 'map',
                map: this.map,
                position: pos,
                entityIdRange,
            }));

            ws.on('close', () => {
                const idx = this.currentPlayers.indexOf(trackingInfo);
                this.currentPlayers.splice(idx, 1);

                this.context.events.emit({
                    type: EventType.WsClose,
                    data: trackingInfo
                });
            });

            // Wait for request to join game...
            // TODO: This is where the board needs to be played.
            ws.on('message', msg => {
                if (msg instanceof Uint8Array) {
                    binaryMessage.data = msg;
                    this.context.events.emit(binaryMessage, trackingInfo);
                }
                // did you know that ws some how emits a Buffer???
                // @ts-ignore
                if (msg.type === "Buffer") {

                    // @ts-ignore
                    binaryMessage.data = msg.data;
                    this.context.events.emit(binaryMessage, trackingInfo);
                }
            });
        });
    }

    public pickPosition(): [number, number] {
        if (this.optionalStartingPositions) {
            return this.optionalStartingPositions[this.optionIdx++];
        }

        return [
            Math.floor(Math.random() * this.width - 2) + 1,
            Math.floor(Math.random() * this.height - 2) + 1
        ];
    }

    public onListening(cb: () => void) {
        this.callbacks.listening.push(cb);
    }

    public shutdown() {
        flush();
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
        tick: +process.env.SERVER_TICK || +process.env.TICK,
        entityIdRange: +process.env.ENTITY_ID_RANGE,
    });
}

ON_DEATH(function(signal: any) {
    process.exit();
});
