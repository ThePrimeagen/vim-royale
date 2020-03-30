import {EntityItem} from "../entities";
import MovementComponent from "../objects/components/movement";

export type MovementAndEntity = {
    entityId: EntityItem,
    movement: MovementComponent,
};

