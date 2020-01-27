import getEntityStore, {EntityItem} from '../entities';
import PositionComponent from './components/position';
import MovementComponent from './components/movement';

export default class Player {
    readonly public entity: EntityItem;
    public position: PositionComponent;
    public movement: MovementComponent;

    constructor(x: number, y: number, char: string) {
        const store = getEntityStore();

        this.entity = store.createNewEntity();

        // TODO: HAHAH 100 hard coded Z? What is this css?
        this.position = new PositionComponent(char, x, y, 100);

        // TODO: Should movement be relative or absolute
        this.movement = new MovementComponent(0, 0);

        store.attachComponent(this.entity, this.position);
        store.attachComponent(this.entity, this.movement);
    }
}


