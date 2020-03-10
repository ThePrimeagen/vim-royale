import {Component} from '../../entities';

export default class Lifetime implements Component {
    public static type: string = "lifetime";
    type: string = "lifetime";

    tilesOrMs: number;

    constructor(tilesOrMs: number) {
        this.tilesOrMs = tilesOrMs;
    }
}


