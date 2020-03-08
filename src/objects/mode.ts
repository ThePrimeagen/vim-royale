import {EntityItem} from '../entities';
import PositionComponent from './components/position';
import GlobalContext, {LocalContext, ScreenType} from '../context';
import ForcePositionComponent from './components/force-position';
import {MovementCommand} from '../types';
import {EventType} from '../events';

export default class Mode {
    public entity: EntityItem;
    public position: PositionComponent;

    constructor(context: LocalContext) {
        this.entity = context.store.createNewEntity();

        // TODO: HAHAH 100 hard coded Z? What is this css?
        this.position = new PositionComponent(
            ScreenType.MainMenu,
            0, GlobalContext.display.height - 1, 100
        );

        context.store.attachComponent(this.entity, this.position);

        context.events.on(evt => {
            if (evt.type === EventType.ScreenTypeChanged) {
                this.position.char[0] = [context.screen];
            }
        });
    }
}


