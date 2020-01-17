export type EventData = {
    type: string;
    data: object;
};

type EventCallback = (event: EventData) => void;

class Event {
    private callbacks: EventCallback[];

    constructor() {
        this.callbacks = [];
    }

    on(cb: EventCallback) {
        this.callbacks.push(cb);
    }

    emit(data: EventData) {
        this.callbacks.forEach(cb => cb(data));
    }
};

const event = new Event();
export default function getEvent() {
    return event;
};
