import { LocalContext, ScreenType } from '../context';
import getLogger from '../logger';
import Bullet from '../objects/bullet';

const logger = getLogger('input-insert');

const BULLET_SPEED_HOR = 0.05;
const BULLET_SPEED_VERT = 0.02;
const BULLET_DISTANCE = 20;

export default {
    handle(context: LocalContext, key: string, ctrl?: boolean): boolean {
        if (ctrl && key === "c" || key === "escape") {
            context.screen = ScreenType.Normal;
            return true;
        }

        switch (key) {
            case 'h':
                new Bullet(context.player.position, -1, 0, -BULLET_SPEED_HOR, 0, BULLET_DISTANCE, context);
                break;
            case 'j':
                new Bullet(context.player.position, 0, 1, 0, BULLET_SPEED_VERT, BULLET_DISTANCE, context);
                break;
            case 'k':
                new Bullet(context.player.position, 0, -1, 0, -BULLET_SPEED_VERT, BULLET_DISTANCE, context);
                break;
            case 'l':
                new Bullet(context.player.position, 1, 0, BULLET_SPEED_HOR, 0, BULLET_DISTANCE, context);
                break;
        }

        // other stuffs???
        return true;
    },

    enter() {
    },
    exit() {
    },
};




