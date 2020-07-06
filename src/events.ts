// TODO: Stop doing whatever this entire file is right now.
// TODO: Stop doing whatever this entire file is right now.
// TODO: Stop doing whatever this entire file is right now.
// TODO: Stop doing whatever this entire file is right now.
// TODO: Stop doing whatever this entire file is right now.
// TODO: Stop doing whatever this entire file is right now.
// TODO: Stop doing whatever this entire file is right now.
// TODO: Stop doing whatever this entire file is right now.
// TODO: Stop doing whatever this entire file is right now.
// TODO: Stop doing whatever this entire file is right now.
// TODO: Stop doing whatever this entire file is right now.
// TODO: Stop doing whatever this entire file is right now.
// TODO: Stop doing whatever this entire file is right now.
// TODO: Stop doing whatever this entire file is right now.
// TODO: Stop doing whatever this entire file is right now.
// TODO: Stop doing whatever this entire file is right now.
import WebSocket from "ws";
import { StartGameMessage, WSMessage } from "./server/commands";
import Stats from "./stats";
import { TrackingInfo } from "./types";
import { Command } from "./types";
import createLogger from "./logger";

const logger = createLogger("Events");

export enum EventType {
    ScreenTypeChanged = "screen-type-changed",
    StartGame = "start-game",
    Run = "run",
    WsOpen = "ws-open",
    WsClose = "ws-close",
    WsMessage = "ws-message",
    WsBinary = "ws-binary",
    ServerMovement = "server-movement",
    Debug = "debug",
    Input = "input",
}

export type InputEvent = {
    type: EventType.Input;
    data: Command[];
};

export interface WsClose {
    type: EventType.WsClose;
    data: TrackingInfo
};

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

export interface ScreenTypeChanged {
    type: EventType.ScreenTypeChanged;
}

export interface ServerMovement {
    type: EventType.ServerMovement;
    data: MovesToProcess[]
}

export interface Debug {
    type: EventType.Debug;
    data: {
        type: string,
        [key: string]: any
    },
}

export type EventData =
    ScreenTypeChanged | WsOpen | WsMessage |
    StartGame | Run | BinaryData | ServerMovement | WsClose | Debug | InputEvent;

type EventCallback = (event: EventData, ...args: any[]) => void;

const runObject: Run = { type: EventType.Run };

interface IEvents {
    on(cb: EventCallback): void;
    on(str: EventType | string, cb: EventCallback): void;
}

export class Events implements IEvents {
    private callbacks: EventCallback[];
    private callbacksByType: { [key: string]: EventCallback[] };

    constructor() {
        this.callbacks = [];
    }

    on(cbOrType: EventCallback | EventType | string, cb?: EventCallback): void {
        if (typeof cbOrType === "function") {
            this.callbacks.push(cbOrType);
        }

        else if (typeof cbOrType === "string") {
            if (!this.callbacksByType[cbOrType]) {
                this.callbacksByType[cbOrType] = [];
            }

            this.callbacksByType[cbOrType].push(cb);
        }
    }

    // Do i even like this?  It creates an addition object allocation every
    // single time we call this method.
    emit(data: EventData, ...additionalArgs: any[]) {
        this.callbacks.forEach(cb => cb(data, ...additionalArgs));
    }

    // Ease of use function
    run() { this.emit(runObject); }

    off(cb: EventCallback) {
        const idx = this.callbacks.indexOf(cb);
        if (~idx) {
            this.callbacks.splice(idx, 1);
        }
    }
};

export default function createEvents() {
    return new Events();
};
