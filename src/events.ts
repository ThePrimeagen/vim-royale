import WebSocket from 'ws';
import { StartGameMessage, WSMessage } from './server/commands';
import Stats from './stats';
import { TrackingInfo } from './types';

export enum EventType {
    StartGame = "start-game",
    Run = "run",
    WsOpen = "ws-open",
    WsMessage = "ws-message",
    WsBinary = "ws-binary",
    ServerMovement = "server-movement",
}

export interface WsOpen {
    type: EventType.WsOpen;
};

export interface WsMessage {
    type: EventType.WsMessage;
    data: WSMessage;
};

export interface StartGame  {
    type: EventType.StartGame;
    data: StartGameMessage
};

export interface BinaryData  {
    type: EventType.WsBinary;
    data: Buffer
};

export interface Run {
    type: EventType.Run;
};

export type MovesToProcess = {
    buf: Buffer,
    tracking: TrackingInfo,
};

export interface ServerMovement {
    type: EventType.ServerMovement;
    data: MovesToProcess[]
}

export interface ServerMovement {
    type: EventType.ServerMovement;
    data: MovesToProcess[]
}

export type EventData =
    WsOpen | WsMessage | StartGame | Run | BinaryData | ServerMovement;

type EventCallback = (event: EventData, ...args: any[]) => void;

class Event {
    private callbacks: EventCallback[];

    constructor() {
        this.callbacks = [];
    }

    on(cb: EventCallback): void {
        this.callbacks.push(cb);
    }

    emit(data: EventData, ...additionalArgs: any[]) {
        this.callbacks.forEach(cb => cb(data, ...additionalArgs));
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

