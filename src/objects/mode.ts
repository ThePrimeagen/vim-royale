import {EntityItem} from '../entities';
import PositionComponent from './components/position';
import StyledComponent from './components/styled';
import GlobalContext, {LocalContext, ScreenType} from '../context';
import {EventType} from '../events';

export default class Mode {
    public entity: EntityItem;
    public position: PositionComponent;
    public styles: StyledComponent;

    constructor(context: LocalContext) {
        this.entity = context.store.createNewEntity();

        // TODO: HAHAH 100 hard coded Z? What is this css?
        this.position = new PositionComponent(
            ScreenType.MainMenu,
            0, GlobalContext.display.height - 1, 100,
            true
        );

        context.store.attachComponent(this.entity, this.position);
        context.events.on(evt => {
            if (evt.type === EventType.ScreenTypeChanged) {
                this.position.setChar(context.screen);
            }
        });
    }
}


