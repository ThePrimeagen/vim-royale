import getEvent from '../events';
import { LocalContext, ScreenType } from '../context';
import getMovement from './getMovement';
import { MovementCommand } from '../types';

function isInsertMode(key: string): boolean {
    return key === "i";
}

function getLastMovement(key: string): MovementCommand | null {
    switch (key) {
        case "j":
        case "k":
        case "l":
        case "h":
            return key as MovementCommand;
    }

    return null;
}

export default {
    handle(context: LocalContext, key: string, ctrl?: boolean): boolean {
        if (isInsertMode(key)) {
            context.screen = ScreenType.Insert;
            return true;
        }

        if (key === "c" && ctrl) {
            process.exit(0);
        }

        const movementCommand = getLastMovement(key);
        const {player} = context;
        const movement = getMovement(key);
        let processed = !!(movement[0] || movement[1]);

        player.movement.x = movement[0];
        player.movement.y = movement[1];
        player.lastMovement = movementCommand;

        return processed;
    },
    enter() {},
    exit() {},
};

