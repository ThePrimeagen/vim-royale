import {InputCommand} from '../../types';
import {Component} from '../../entities';

export default class MovementComponent implements Component {
    public static type: string = "movement";
    type: string = "movement";

    public lastMovement: InputCommand;

    public movementId: number;

    x: number;
    y: number;

    constructor(x: number = 0, y: number = 0) {
        this.x = x;
        this.y = y;
        this.movementId = 0;
    }
};

