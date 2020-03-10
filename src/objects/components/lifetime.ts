import {Component} from '../../entities';

export default class Lifetime implements Component {
    public static type: string = "lifetime";
    type: string = "lifetime";

    decrementOnMs: boolean;
    tilesOrMs: number;

    constructor(tilesOrMs: number, decrementOnMs: boolean) {
        this.tilesOrMs = tilesOrMs;
        this.decrementOnMs = decrementOnMs;
    }
}


