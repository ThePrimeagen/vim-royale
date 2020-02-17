import path from 'path';

import WebSocket from 'ws';

import { EntityItem } from './entities';
import getEvents, { EventType } from './events';
import { updatePosition, createEntity } from './server/messages';
import GlobalContext, { LocalContext } from './context';
import { WSMessage } from './server/commands';

export default class ClientSocket {
    private context: LocalContext;
    private ws: WebSocket;
    private open: () => void;
    private message: (msg: any) => void;

    public mode: string;

    constructor(host: string, port: number, context: LocalContext) {
        const ws = new WebSocket(`ws://${host}:${port}`);

        this.context = context;
        this.open = () => {
            context.events.emit({
                type: EventType.WsOpen
            });
        };
        ws.on('open', this.open);

        this.message = msg => {
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

            context.events.emit({
                type,
                data: m
            });
        };
        ws.on('message', this.message);

        /*
        ws.on('close', () => {
            // TODO: reconnect socket.
        });

        ws.on('error', () => {
            // TODO: reconnect socket.
        });
         */

        this.ws = ws;
    }

    shutdown() {
        this.ws.off('message', this.message);
        this.ws.off('open', this.open);
        this.ws.close();
    }

    createEntity(entityId: EntityItem, x: number, y: number) {

        const buf = createEntity({
            entityId,
            x,
            y
        });

        console.log("createEntity", entityId);
        this.ws.send(buf);
    }

    confirmMovement(movementId: number) {
        const player = this.context.player;
        const pos = player.position;

        const buf = updatePosition({
            cmd: player.lastMovement,
            movementId,
            entityId: player.entity,
            x: pos.x,
            y: pos.y
        });


        this.ws.send(buf);
    }
};
