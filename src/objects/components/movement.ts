import {Component} from '../../entities';

export default class MovementComponent implements Component {
    public static type: string = "movement";
    type: string = "movement";

    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
};

console.error("MovementComponent", MovementComponent.type);

