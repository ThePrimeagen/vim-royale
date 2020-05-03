import {
    LocalContext,
    GameContext,
    ScreenType
} from '../context';

import getLogger from '../logger';
import Bullet from '../objects/bullet';

const logger = getLogger('input-insert');

export default {
    handle(context: LocalContext, key: string, ctrl?: boolean): boolean {
        if (ctrl && key === "c" || key === "escape") {
            context.screen = ScreenType.Normal;
            return true;
        }

        let b: Bullet;
        switch (key) {
            case 'h':
                b = new Bullet(
                    context.player.position, -1, 0,
                    -GameContext.bulletSpeedHor, 0,
                    GameContext.bulletDistanceHor, context);
                break;
            case 'j':
                b = new Bullet(context.player.position, 0, 1, 0,
                   GameContext.bulletSpeedVert,
                   GameContext.bulletDistancesVert, context);
                break;
            case 'k':
                b = new Bullet(context.player.position, 0, -1, 0,
                   -GameContext.bulletSpeedVert,
                    GameContext.bulletDistancesVert, context);
                break;
            case 'l':
                b = new Bullet(context.player.position, 1, 0,
                   GameContext.bulletSpeedHor, 0,
                   GameContext.bulletDistanceHor, context);
                break;
        }

        if (b) {
            b.enableCreateEntity();
        }

        // other stuffs???
        return true;
    },

    enter() {
    },
    exit() {
    },
};

