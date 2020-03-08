import { LocalContext, ScreenType } from '../context';
import getLogger from '../logger';

const logger = getLogger('input-main-menu');

export default {
    handle(context: LocalContext, key: string, ctrl?: boolean): boolean {
        if (ctrl && key === "c" || key === "escape") {
            process.exit(0);
            return true;
        }

        logger(key);

        // other stuffs???
        return true;
    },
    enter() {
    },
    exit() {
    },
};




