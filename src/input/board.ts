import getEvent from '../events';
import GlobalContext from '../context';
import getMovement from './getMovement';
import { MovementCommand } from '../types';

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

export default function board(key: string): boolean {
    const {player} = GlobalContext;
    const movement = getMovement(key);
    let processed = !!(movement[0] || movement[1]);

    player.movement.x = movement[0];
    player.movement.y = movement[1];

    console.error("Player Movement", player.movement);

    GlobalContext.player.lastMovement = getLastMovement(key);

    return processed;
};

