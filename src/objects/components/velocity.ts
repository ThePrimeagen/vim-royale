import {Component} from '../../entities';

export default class VelocityComponent implements Component {
    public static type: string = "velocity";
    type: string = "velocity";
    createdAt: number;

    // Tiles / MS
    velX: number;
    velY: number;
    x: number;
    y: number;

    constructor(x: number, y: number, velX: number = 0, velY: number = 0) {
        this.createdAt = Date.now();
        this.x = x;
        this.y = y;
        this.velX = velX;
        this.velY = velY;
    }
}

