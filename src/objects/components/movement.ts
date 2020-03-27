import {Component} from '../../entities';

export default class MovementComponent implements Component {
    public static type: string = "movement";
    type: string = "movement";

    x: number;
    y: number;

    constructor(x: number = 0, y: number = 0) {
        this.x = x;
        this.y = y;
    }
};

