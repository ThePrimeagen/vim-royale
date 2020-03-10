import {Component} from '../../entities';

// What we render
export default class PositionComponent implements Component {
    public static type: string = "position";
    absolute: boolean;
    type: string = "position";
    x: number;
    y: number;
    z: number;
    char: string[][];

    constructor(char: string, x: number, y: number, z: number = 0, absolute = false) {
        this.char = [[char]];
        this.x = x;
        this.y = y;
        this.z = z;
        this.absolute = absolute;
    }
}
