import {LocalContext} from '../../context';
import {Component, EntityItem} from '../../entities';
import LifetimeComponent from '../../objects/components/lifetime';
import createLogger from '../../logger';

const logger = createLogger("LifetimeComponent");

export default class Lifetime implements Component {
    public static type: string = "lifetime";
    type: string = "lifetime";

    decrementOnMs: boolean;
    tilesOrMs: number;
    createdAt: number;

    constructor(tilesOrMs: number, decrementOnMs: boolean) {
        this.tilesOrMs = tilesOrMs;
        this.decrementOnMs = decrementOnMs;
        this.createdAt = Date.now();
    }

    isAlive(): boolean {
        return this.tilesOrMs > 0;
    }

    move(amount: number): void {
        if (!this.decrementOnMs) {
            this.tilesOrMs -= amount;
        }
    }

    time(amount: number): void {
        if (this.decrementOnMs) {
            this.tilesOrMs -= amount;
        }
    }

    private static get(context: LocalContext, entityId: EntityItem): LifetimeComponent {
        return context.store.
            // @ts-ignore
            getComponent<LifetimeComponent>(entityId, LifetimeComponent) as LifetimeComponent;
    }

    static move(context: LocalContext, entityId: EntityItem, amount: number) {
        const lt = LifetimeComponent.get(context, entityId);
        logger("Entity:", entityId, amount, lt, lt?.tilesOrMs);
        lt?.move(amount);
    }

    static time(context: LocalContext, entityId: EntityItem, amount: number) {
        const lt = LifetimeComponent.get(context, entityId);
        lt?.time(amount);
    }
}


