import WebSocket from 'ws';
import Stats from './stats/index';

export enum CommandType {
    Count = 0,
    Motion,
    Input,
};

export type Command = {
    type: CommandType;
    char: string;
}

export type GameOptions = {
    width: number;
    height: number;
};

export type TrackingInfo = {
    entityIdRange: [number, number];
    movementId: number;
    ws: WebSocket;
    stats: Stats;
    id: number;
};

export type InputCommand = {
    count: number;
    key: Command[];
};



