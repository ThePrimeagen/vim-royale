import WebSocket from 'ws';

import { MapMessage, WSMessage } from './server/commands';

export enum EventType {
    StartGame = "start-game",
    Run = "run",
    WsOpen = "ws-open",
    WsMessage = "ws-message",
    WsBinary = "ws-binary",
    ServerMovement = "server-movement",
}

export interface StartGame  {
    type: EventType.StartGame;
    data: MapMessage
};

export interface BinaryData  {
    type: EventType.WsBinary;
    data: Buffer;
    ws: WebSocket;
};

export interface Run  {
    type: EventType.Run;
};

export interface WS  {
    type: EventType.WsMessage | EventType.WsOpen | EventType.WsBinary;
    data?: WSMessage
}

export interface ServerMovement {
    type: EventType.ServerMovement;
    data: Buffer[]
}

export type EventData = StartGame | Run | WS | BinaryData | ServerMovement;

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
