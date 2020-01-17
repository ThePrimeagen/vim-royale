import {Component} from '../../entities';

export default class PositionComponent implements Component {
    public static type: string = "position";
    type: string = "position";
    x: number;
    y: number;
    z: number;
    char: string[][];

    constructor(char: string, x: number, y: number, z: number = 0) {
        this.char = [[char]];
        this.x = x;
        this.y = y;
        this.z = z;
    }
}

console.error("PositionComponent", PositionComponent.type);
