import isServer from '../util/is-server';
import {EntityItem} from '../entities';
import CreateEntityComponent from './components/create-entity';
import PositionComponent from './components/position';
import MovementComponent from './components/movement';
import VelocityComponent from './components/velocity';
import LifetimeComponent from './components/lifetime';
import {LocalContext} from '../context';
import {EntityType} from './types';
import {Encodable, writeBuffer, readBuffer} from './encodable';
import BufferWriter from '../server/messages/buffer-writer';
import BufferReader from '../server/messages/buffer-reader';
import createLogger from '../logger';

const logger = createLogger("Bullet");

const BULLET_CHAR = '\u2022';

export type Direction = 0 | 1 | -1;
export default class Bullet implements Encodable {
    public entity: EntityItem;
    public context: LocalContext;
    public position: PositionComponent;
    public movement: MovementComponent;
    public velocity: VelocityComponent;
    public lifetime: LifetimeComponent;

    constructor(position: PositionComponent, x: Direction, y: Direction,
        velocityX: number, velocityY: number, lifetime: number,
        context: LocalContext) {

        this.context = context;
        this.entity = context.store.createNewEntity();

        // TODO: HAHAH 100 hard coded Z? What is this css?
        const xPos = position.x + x;
        const yPos = position.y + y;

        this.position = new PositionComponent(
            BULLET_CHAR, xPos, yPos, 50);

        // TODO: Should movement be relative or absolute
        this.movement = new MovementComponent(0, 0);

        this.velocity = new VelocityComponent(xPos, yPos, velocityX, velocityY);
        this.lifetime = new LifetimeComponent(lifetime, false);

        context.store.attachComponent(this.entity, this.position);
        context.store.attachComponent(this.entity, this.movement);
        context.store.attachComponent(this.entity, this.velocity);
        context.store.attachComponent(this.entity, this.lifetime);

        logger("Bullet Constructor", this.velocity);
        context.socket.createEntity(this, Bullet);
    }

    getEntityId(): number {
        return this.entity;
    }

    encode(buffer: Buffer, offset: number = 0) {
        writeBuffer.reset(buffer);
        writeBuffer.movePointer(offset);
        writeBuffer.write8(EntityType.Bullet);

        writeBuffer.write24(this.entity);
        writeBuffer.write16(this.position.x);
        writeBuffer.write16(this.position.y);

        //  I guess, but I'll have to do some server validation...
        // TODO: Do we do this ever?
        writeBuffer.write8(this.velocity.velX);
        writeBuffer.write8(this.velocity.velY);

        // TODO: Validate also
        writeBuffer.write8(this.lifetime.tilesOrMs);
    }

    static decode(context: LocalContext, buffer: Buffer, offset: number): EntityItem {
        readBuffer.reset(buffer, offset);

        // read off the type
        const type = readBuffer.read8();
        if (type !== EntityType.Bullet) {
            throw new Error(`Encoding error got ${type} but expected ${EntityType.Player}`);
        }

        const entity = readBuffer.read24();
        const x = readBuffer.read16();
        const y = readBuffer.read16();
        const velocityX = readBuffer.read8();
        const velocityY = readBuffer.read8();
        const lt = readBuffer.read8();

        const position = new PositionComponent(BULLET_CHAR, x, y);
        const movement = new MovementComponent();
        const velocity = new VelocityComponent(x, y, velocityX, velocityY);
        const lifetime = new LifetimeComponent(lt, false);

        logger("Decode", entity, velocity, position);
        context.store.setNewEntity(entity);
        context.store.attachComponent(entity, position);
        context.store.attachComponent(entity, movement);
        context.store.attachComponent(entity, velocity);
        context.store.attachComponent(entity, lifetime);

        if (isServer()) {
            const createEntity = new CreateEntityComponent();
            context.store.attachComponent(entity, createEntity);
        }

        return entity;
    }

    static is(buffer: Buffer, offset: number = 0): boolean {
        return buffer[offset] === EntityType.Bullet;
    }

    static encodeLength: number = 11;
}


