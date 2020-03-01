import WebSocket from 'ws';
import Stats from './stats/index';
import PositionComponent from './objects/components/position';

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

export type MovementCommand = 'k' | 'j' | 'l' | 'h';



