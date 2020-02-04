import WebSocket from 'ws';
import Stats from './stats/index';

export type GameOptions = {
    width: number;
    height: number;
};

export type TrackingInfo = {
    ws: WebSocket,
    stats: Stats,
};

export type MovementCommand = 'k' | 'j' | 'l' | 'h';



