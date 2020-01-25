import path from 'path';

import WebSocket from 'ws';

import getEvents from './events';
import { WSMessage } from './server/commands';

const events = getEvents();

export default class ClientSocket {
    private ws: WebSocket;

    public mode: string;

    constructor() {
        this.mode = 'json';

        const ws = new WebSocket(`ws://${process.env.HOST}:${process.env.PORT}`);
        ws.on('open', () => {
            events.emit({
                type: 'ws-open'
            });
        });

        ws.on('message', msg => {
            let m;
            if (this.mode === 'json') {

                // @ts-ignore
                let wsMessage = JSON.parse(msg) as WSMessage;

                if (wsMessage.type === 'status') {
                    this.mode = wsMessage.encoding;
                    return;
                }

                m = wsMessage;
            }
            else {
                m = msg;
            }

            events.emit({
                type: 'ws-message',
                data: m
            });
        });

        ws.on('close', () => {
            // TODO: reconnect socket.
        });

        ws.on('error', () => {
            // TODO: reconnect socket.
        });

        this.ws = ws;
    }

    confirmMovement(x: number, y: number) {
    }
};
