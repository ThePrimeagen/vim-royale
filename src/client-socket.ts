import path from 'path';

import WebSocket from 'ws';

import getEvents, { EventType } from './events';
import { WSMessage } from './server/commands';

const events = getEvents();

export default class ClientSocket {
    private ws: WebSocket;

    public mode: string;

    constructor() {
        const ws = new WebSocket(`ws://${process.env.HOST}:${process.env.PORT}`);
        ws.on('open', () => {
            events.emit({
                type: EventType.WsOpen
            });
        });

        ws.on('message', msg => {
            let m;
            let type: EventType = EventType.WsMessage;

            if (typeof msg === 'string') {

                // @ts-ignore
                let wsMessage = JSON.parse(msg) as WSMessage;

                // TODO: Probably should have some thing here.  THis would be
                // like game specific stuffs.
                if (wsMessage.type === 'status') {
                    return;
                }

                m = wsMessage;
            }
            else {
                m = msg;
                type = EventType.WsBinary;
            }

            events.emit({
                type,
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
