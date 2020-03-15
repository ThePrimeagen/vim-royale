import {Component} from '../../entities';

// What we render
export default class PositionComponent implements Component {
    public static type: string = "position";
    absolute: boolean;
    type: string = "position";
    x: number;
    y: number;
    z: number;
    private _char: string[][];

    get char(): string[][] {
        return this._char;
    }

    constructor(char: string, x: number, y: number, z: number = 0, absolute = false) {
        this.setChar(char);
        this.x = x;
        this.y = y;
        this.z = z;
        this.absolute = absolute;
    }

    setChar(char: string) {
        this._char = [char.split("")];
        /*
        this._char[0][0] = "{#FF0000-bg}{#96A537-fg}" + this._char[0][0];
        const last = this._char[0].length;
        this._char[0][last - 1] =  this._char[0][last - 1] + "{/#96A537-fg}{/#FF0000-bg}";
         */
    }
}
