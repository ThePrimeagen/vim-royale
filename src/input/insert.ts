import { LocalContext, ScreenType } from '../context';
import getLogger from '../logger';
import Bullet from '../objects/bullet';

const logger = getLogger('input-insert');

const BULLET_SPEED_HOR = 3;
const BULLET_SPEED_VERT = 2;
const BULLET_DISTANCE_HOR = 30;
const BULLET_DISTANCES_VERT = 20;

export default {
    handle(context: LocalContext, key: string, ctrl?: boolean): boolean {
        if (ctrl && key === "c" || key === "escape") {
            context.screen = ScreenType.Normal;
            return true;
        }

        let b: Bullet;
        switch (key) {
            case 'h':
                b = new Bullet(context.player.position, -1, 0, -BULLET_SPEED_HOR, 0, BULLET_DISTANCE_HOR, context);
                break;
            case 'j':
                b = new Bullet(context.player.position, 0, 1, 0, BULLET_SPEED_VERT, BULLET_DISTANCES_VERT, context);
                break;
            case 'k':
                b = new Bullet(context.player.position, 0, -1, 0, -BULLET_SPEED_VERT, BULLET_DISTANCES_VERT, context);
                break;
            case 'l':
                b = new Bullet(context.player.position, 1, 0, BULLET_SPEED_HOR, 0, BULLET_DISTANCE_HOR, context);
                break;
        }

        b.enableCreateEntity();

        // other stuffs???
        return true;
    },

    enter() {
    },
    exit() {
    },
};




