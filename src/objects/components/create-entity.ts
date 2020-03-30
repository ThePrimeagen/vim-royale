import {Encodable, Decodable} from '../encodable';
import {Component, EntityItem} from '../../entities';

// What we render
export default class CreateEntityComponent implements Component {
    // TODO: CAN WE JUST MAKE THIS A NUMBER??
    public static type: string = "ce";
    type: string = "ce";
    public enc: Encodable;
    public dec: Decodable;
    public entityId: EntityItem;

    constructor(entity: EntityItem, enc: Encodable, dec: Decodable) {
        this.entityId = entity;
        this.enc = enc
        this.dec = dec
    }
}


