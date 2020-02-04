import {Component} from '../../entities';

export default class ForcePositionComponent implements Component {

    // TODO: Enum?
    public static type: string = "force-position";
    type: string = "force-position";

    x: number;
    y: number;
    movementId: number;
    force: boolean;

    constructor() {
        this.x = 0;
        this.y = 0;
        this.force = false;
    }
};


