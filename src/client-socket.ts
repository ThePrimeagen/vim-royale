import path from 'path';

import WebSocket from 'ws';

import { EntityItem } from './entities';
import getEvents, { EventType } from './events';
import { updatePosition, createEntity } from './server/messages';
import GlobalContext, { LocalContext } from './context';
import { WSMessage } from './server/commands';
import getLogger from './logger';
import { Encodable, Decodable } from './objects/encodable';

const logger = getLogger('client-socket');

let id = 0;
export default class ClientSocket {
    private context: LocalContext;
    private ws: WebSocket;
    private open: () => void;
    private message: (msg: any) => void;

    public mode: string;

    public readonly id: number;

    constructor(host: string, port: number, context: LocalContext) {
        this.id = ++id;

        logger("New ClientSocket", this.id, context.id);

        const ws = new WebSocket(`ws://${host}:${port}`);

        this.context = context;

        this.open = () => {
            logger("open", this.id, context.id);
            context.events.emit({
                type: EventType.WsOpen
            });
        };

        ws.on('open', this.open);

        this.message = msg => {
            let m;
            let type: EventType = EventType.WsMessage;

            logger("message", this.id, context.id, type);
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

        ws.on('close', () => {
            logger("close", this.id);

            // huh?
        });

        ws.on('error', () => {
            // TODO: reconnect socket.
            logger("error", this.id);
            //
            // huh?
        });

        this.ws = ws;
    }

    shutdown() {
        logger("Shutdown", this.id);
        this.ws.off('message', this.message);
        this.ws.off('open', this.open);
        this.ws.close();
    }

    createEntity(encodable: Encodable, info: Decodable) {
        const buf = createEntity(encodable, info.encodeLength);

        logger("createEntity", encodable.getEntityId(), this.id);

        try {
            this.ws.send(buf);
        } catch (e) {
            logger("ERROR", e);
        }
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
