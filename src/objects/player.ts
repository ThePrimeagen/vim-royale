import {ObjectInfo} from './types';

export default class Player implements ObjectInfo {
    x: number;
    y: number;
    char: string;
    cb: (p: Player) => void;

    constructor(x: number, y: number, char: string) {
        this.x = x;
        this.y = y;
        this.char = char;
    }

    onUpdate(cb: (p: Player) => void) {
        this.cb = cb;
    }
}


