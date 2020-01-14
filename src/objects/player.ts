import getEntityStore, {EntityItem} from '../entities';
import PositionComponent from './components/position';

export default class Player {
    private entity: EntityItem;
    public position: PositionComponent;

    constructor(x: number, y: number, char: string) {
        const store = getEntityStore();

        this.entity = store.createNewEntity();

        // TODO: HAHAH 100 hard coded Z? What is this css?
        this.position = new PositionComponent(char, x, y, 100);
        store.attachComponent(this.entity, this.position);
    }
}


