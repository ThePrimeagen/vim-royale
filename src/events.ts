import WebSocket from 'ws';

import { MapMessage, WSMessage } from './server/commands';

export enum EventType {
    StartGame = "start-game",
    Run = "run",
    WsOpen = "ws-open",
    WsMessage = "ws-message",
    WsBinary = "ws-binary",
}

export type StartGame = { type: EventTypes.StartGame; data: MapMessage };
export type BinaryData = { type: EventTypes.WsBinary; data: Buffer, ws: WebSocket };
export type Run = { type: EventTypes.Run; }
export type WS = {
    type: EventTypes.WsMessage | EventTypes.WsOpen;
    data?: WSMessage
}

export type EventData = StartGame | Run | WS | BinaryData;

type EventCallback = (event: EventData) => void;

class Event {
    private callbacks: EventCallback[];

    constructor() {
        this.callbacks = [];
    }

    on(cb: EventCallback): void {
        this.callbacks.push(cb);
    }

    emit(data: EventData) {
        this.callbacks.forEach(cb => cb(data));
    }

    off(cb: EventCallback) {
        const idx = this.callbacks.indexOf(cb);
        if (~idx) {
            this.callbacks.splice(idx, 1);
        }
    }
};

const event = new Event();
export default function getEvent() {
    return event;
};
