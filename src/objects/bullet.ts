import {EntityItem} from '../entities';
import PositionComponent from './components/position';
import MovementComponent from './components/movement';
import VelocityComponent from './components/velocity';
import LifetimeComponent from './components/lifetime';
import {LocalContext} from '../context';

const BULLET_CHAR = '\u2022';

export type Direction = 0 | 1 | -1;
export default class Bullet {
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
    }
}



