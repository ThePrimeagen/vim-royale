import isServer from '../util/is-server';
import {EntityItem} from '../entities';
import PositionComponent from './components/position';
import MovementComponent from './components/movement';
import {LocalContext} from '../context';
import ForcePositionComponent from './components/force-position';
import NetworkSyncComponent from './components/network-sync';
import CreateEntityComponent from './components/create-entity';
import {Encodable, writeBuffer, readBuffer} from './encodable';
import {EntityType} from './types';
import BufferWriter from '../server/messages/buffer-writer';
import BufferReader from '../server/messages/buffer-reader';

export default class Player implements Encodable {

    public entity: EntityItem;
    public context: LocalContext;
    public position: PositionComponent;
    public network: NetworkSyncComponent;
    public movement: MovementComponent;
    public forcePosition: ForcePositionComponent;

    // TODO: I don't like this interface.
    constructor(x: number, y: number, char: string, context: LocalContext, entityId?: number) {
        this.context = context;

        if (entityId !== undefined) {
            this.entity = entityId;
            context.store.setNewEntity(entityId);
        }
        else {
            this.entity = context.store.createNewEntity();
        }

        this.position = new PositionComponent(char, x, y, 100);
        this.movement = new MovementComponent(0, 0);
        this.network = new NetworkSyncComponent();

        context.store.attachComponent(this.entity, this.position);
        context.store.attachComponent(this.entity, this.movement);
        context.store.attachComponent(this.entity, this.network);
    }

    enableCreateEntity() {
        const createEntity =
            new CreateEntityComponent(this.entity, this, Player);

        this.context.store.attachComponent(this.entity, createEntity);
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

    // Note:
    //
    // Decoding is interesting.  It does not create a full object, but just a
    // partial rep on the server or other client.  This partial version does
    // not need network, or else, you know, it would be weird.
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

        // TODO: Consider a pool, especially when it comes to bullets.
        new Player(x, y, String.fromCharCode(char), context, entity);

        return entity;
    }

    public static encodeLength: number = 9;
    static is(buffer: Buffer, offset: number = 0): boolean {
        return buffer[offset] === EntityType.Player;
    }
}


