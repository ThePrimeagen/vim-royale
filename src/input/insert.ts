import { LocalContext, ScreenType } from '../context';
import getLogger from '../logger';

const logger = getLogger('input-insert');

export default {
    handle(context: LocalContext, key: string, ctrl?: boolean): boolean {
        if (ctrl && key === "c" || key === "escape") {
            context.screen = ScreenType.Normal;
            return true;
        }

        // other stuffs???
        return true;
    },
    enter() {
    },
    exit() {
    },
};




