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

export type MapLayout = {
    width: number;
    height: number;
    map: string[][];
};

export type MapMessage = {
    type: 'map';
    map: MapLayout;
    position: [number, number];
}

export type WSMessage = StatusMessage | MapMessage;
