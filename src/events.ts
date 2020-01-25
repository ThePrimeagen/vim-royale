import { MapMessage, WSMessage } from './server/commands';

export type StartGame = { type: "start-game"; data: MapMessage }
export type Run = { type: "run"; }
export type WS = {
    type: "ws-open" | "ws-message";
    data?: WSMessage
}

export type EventData = StartGame | Run | WS;

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
