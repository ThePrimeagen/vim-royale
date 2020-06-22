import { LocalContext, ScreenType } from "../context";
import getMovement from "./getMovement";
import { CommandType, Command, FNode, HjklNode, CountNode, CommandNode } from "./command-node";

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

export class CommandProcessor {
    private timerId = 0;
    private commands: CommandNode[];
    private curr?: CommandNode;
    private listOfExecuted: CommandNode[];

    constructor() {
        this.listOfExecuted = [];

        this.commands = [
            new HjklNode(),
            new CountNode(),
            new FNode(),
        ];

        this.curr = null;
    }

    processKey(key: string): boolean {
        return false;
    }
}

let lastKeyTime = 0;
let lastCountKey: number | null = null;

// <number>hjkl, ftFT<onscreen>
// v :
//   fFtT<letter>
//   <number>hjkl
//
//

export default {
    handle(context: LocalContext, key: string, ctrl?: boolean): boolean {

        if (isInsertMode(key)) {
            context.screen = ScreenType.Insert;
            return true;
        }

        // TODO: We should probably do some sort of menu.
        if (key === "c" && ctrl) {
            process.exit(0);
        }

        // TODO: Putting the kids down.
        // TODO: Putting the kids down.
        // TODO: Putting the kids down.
        // TODO: Putting the kids down.
        // TODO: Putting the kids down.
        // TODO: Putting the kids down.
        // TODO: Putting the kids down.
        // TODO: Putting the kids down.
        // TODO: Putting the kids down.
        // TODO: Putting the kids down.
        // TODO: Putting the kids down.
        // TODO: Putting the kids down.
        // TODO: Putting the kids down.
        // TODO: Putting the kids down.
        // TODO: Putting the kids down.
        // TODO: Putting the kids down.

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

