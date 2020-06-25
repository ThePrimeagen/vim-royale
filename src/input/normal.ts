import { LocalContext, ScreenType } from "../context";
import getMovement from "./getMovement";
import { CommandProcessor } from "./command-node";
import getLogger from "../logger";

const logger = getLogger("Input#Normal");

function isInsertMode(key: string): boolean {
    return key === "i";
}

export default {
    processor: new CommandProcessor(),

    clear() {
        this.processor.reset();
    },

    handle(context: LocalContext, key: string, ctrl?: boolean): boolean {

        if (isInsertMode(key)) {
            context.screen = ScreenType.Insert;
            return true;
        }

        // TODO: We should probably do some sort of menu.
        if (key === "c" && ctrl) {
            process.exit(0);
        }

        const results = this.processor.processKey(key);
        if (results) {
            const movementObj = {
                key: results[results.length - 1].char,
                count: 1
            };

            if (results.length === 2) {
                movementObj.count = +results[0].char;
            }

            const movement = getMovement(movementObj);

            const {player} = context;
            player.movement.x = movement[0];
            player.movement.y = movement[1];

            player.movement.lastMovement = movementObj;

            return true;
        }

        return false;
    },
    enter() {},
    exit() {},
};

