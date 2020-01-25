export function isStatusCommand(msg: WSMessage): boolean {
    return msg.type === 'status';
};

export function isMapCommand(msg: WSMessage): boolean {
    return msg.type === 'map';
};

export type StatusMessage = {
    type: 'status';
    status: string;
    encoding: string;
};

export type MapMessage = {
    type: 'map';
    map: string[][];
    position: [number, number];
}

export type WSMessage = StatusMessage | MapMessage;
