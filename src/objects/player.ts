import {EntityItem} from '../entities';
import PositionComponent from './components/position';
import MovementComponent from './components/movement';
import {LocalContext} from '../context';
import ForcePositionComponent from './components/force-position';
import {MovementCommand} from '../types';
import {Encodable, writeBuffer, readBuffer} from './encodable';
import {EntityType} from './types';
import BufferWriter from '../server/messages/buffer-writer';
import BufferReader from '../server/messages/buffer-reader';

export default class Player implements Encodable {

    public entity: EntityItem;
    public context: LocalContext;
    public position: PositionComponent;
    public movement: MovementComponent;
    public forcePosition: ForcePositionComponent;

    public lastMovement: MovementCommand;

    constructor(x: number, y: number, char: string, context: LocalContext) {
        this.context = context;
        this.entity = context.store.createNewEntity();

        // TODO: HAHAH 100 hard coded Z? What is this css?
        this.position = new PositionComponent(char, x, y, 100);

        // TODO: Should movement be relative or absolute
        this.movement = new MovementComponent(0, 0);

        context.store.attachComponent(this.entity, this.position);
        context.store.attachComponent(this.entity, this.movement);

    }

    enableForcedMovement() {
        this.forcePosition = new ForcePositionComponent();
        this.context.store.attachComponent(this.entity, this.forcePosition);
    }

    getEntityId(): number {
        return this.entity;
    }

    encode(buffer: Buffer, offset: number = 0) {
        writeBuffer.reset(buffer);
        writeBuffer.movePointer(offset);
        writeBuffer.write8(EntityType.Player);

        writeBuffer.write24(this.entity);
        writeBuffer.write16(this.position.x);
        writeBuffer.write16(this.position.y);
        writeBuffer.writeStr(this.position.char[0][0]);
    }

    static decode(context: LocalContext, buffer: Buffer, offset: number): EntityItem {
        readBuffer.reset(buffer, offset);

        // read off the type
        const type = readBuffer.read8();
        if (type !== EntityType.Player) {
            throw new Error(`Encoding error got ${type} but expected ${EntityType.Player}`);
        }

        const entity = readBuffer.read24();
        const x = readBuffer.read16();
        const y = readBuffer.read16();
        const char = readBuffer.read8();

        const position = new PositionComponent(String.fromCharCode(char), x, y);
        const movement = new MovementComponent();

        context.store.setNewEntity(entity);
        context.store.attachComponent(entity, position);
        context.store.attachComponent(entity, movement);

        return entity;
    }

    static encodeLength: number = 9;
    static is(buffer: Buffer, offset: number = 0): boolean {
        return buffer[offset] === EntityType.Player;
    }
}


