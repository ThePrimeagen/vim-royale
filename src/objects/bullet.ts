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
import createLogger from '../logger';

const logger = createLogger("Bullet");

const BULLET_CHAR = '\u2022';

export type Direction = 0 | 1 | -1;
const tempPosition = new PositionComponent(BULLET_CHAR, 0, 0);

export default class Bullet implements Encodable {
    public entity: EntityItem;
    public context: LocalContext;
    public position: PositionComponent;
    public movement: MovementComponent;
    public velocity: VelocityComponent;
    public lifetime: LifetimeComponent;
    public createEntity: CreateEntityComponent;

    // TODO: Make the x,y,vel, and lyfetime use an object config.  Cache that
    // object.
    constructor(position: PositionComponent, x: Direction, y: Direction,
        velocityX: number, velocityY: number, lifetime: number,
        context: LocalContext, entityId?: number) {

        this.context = context;
        if (entityId !== undefined) {
            this.entity = entityId;
            context.store.setNewEntity(entityId);
        }
        else {
            this.entity = context.store.createNewEntity();
        }

        // TODO: HAHAH 100 hard coded Z? What is this css?
        const xPos = position.x + x;
        const yPos = position.y + y;

        this.position = new PositionComponent(
            BULLET_CHAR, xPos, yPos, 50);

        // Top 5 Commands
        //

        // TODO: Should movement be relative or absolute
        this.movement = new MovementComponent(0, 0);
        this.velocity = new VelocityComponent(xPos, yPos, velocityX, velocityY);
        this.lifetime = new LifetimeComponent(lifetime, false);
        this.createEntity = new CreateEntityComponent(this.entity, this, Bullet);

        context.store.attachComponent(this.entity, this.position);
        context.store.attachComponent(this.entity, this.movement);
        context.store.attachComponent(this.entity, this.velocity);
        context.store.attachComponent(this.entity, this.lifetime);
    }

    enableCreateEntity() {
        const createEntity =
            new CreateEntityComponent(this.entity, this, Bullet);

        this.context.store.attachComponent(this.entity, createEntity);
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
        writeBuffer.write16(this.velocity.x);
        writeBuffer.write16(this.velocity.y);

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
            throw new Error(`Encoding error got ${type} but expected ${EntityType.Bullet}`);
        }

        const entity = readBuffer.read24();
        const x = readBuffer.read16();
        const y = readBuffer.read16();
        const velocityX = readBuffer.read8();
        const velocityY = readBuffer.read8();
        const lt = readBuffer.read8();

        tempPosition.x = x;
        tempPosition.y = y;

        logger("Creating Bullet", tempPosition, 0, 0, velocityX, velocityY, lt, "context", entity);
        const b = new Bullet(tempPosition, 0, 0,
            velocityX, velocityY, lt,
            context, entity);

        if (isServer()) {
            b.enableCreateEntity();
        }

        return entity;
    }

    static is(buffer: Buffer, offset: number = 0): boolean {
        return buffer[offset] === EntityType.Bullet;
    }

    static encodeLength: number = 15;
}


