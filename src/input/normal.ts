import { LocalContext, ScreenType } from '../context';
import getMovement from './getMovement';
import { InputCommand } from '../types';

const MODIFIER_TTL = +process.env.MODIFIER_TTL;

function isInsertMode(key: string): boolean {
    return key === "i";
}

// TODO: movement validation, and sorta debounce
// 2 (alter the next move for 200 ms)
// j (terminal) terminal
function isMovementKey(key: string): boolean {
    switch (key) {
        case "j":
        case "k":
        case "l":
        case "h":
            return true;
    }

    return false;
}

// You cannot move, more than 12 spaces at once with <number>jhkl
// TODO: Really actually do an eventing system.  This is just do do garbage
//

let lastKeyTime = 0;
let lastCountKey: number | null = null;

const tmpMovementObj = {
    key: "",
    count: 0
};

export default {
    handle(context: LocalContext, key: string, ctrl?: boolean): boolean {

        if (isInsertMode(key)) {
            context.screen = ScreenType.Insert;
            return true;
        }

        if (key === "c" && ctrl) {
            process.exit(0);
        }

        let processed = false;
        if (isMovementKey(key)) {
            const {player} = context;
            let count = 1;
            if (Date.now() - lastKeyTime < MODIFIER_TTL) {
                count = lastCountKey;
            }

            const movementObj = {
                key,
                count
            };

            const movement = getMovement(movementObj);
            processed = !!(movement[0] || movement[1]);

            player.movement.x = movement[0];
            player.movement.y = movement[1];

            player.movement.lastMovement = movementObj;
        }

        const keyAsNumber = +key;
        if (!isNaN(keyAsNumber)) {
            lastKeyTime = Date.now();
            lastCountKey = keyAsNumber;
        }

        return processed;
    },
    enter() {},
    exit() {},
};

