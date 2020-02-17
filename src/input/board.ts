import getEvent from '../events';
import { LocalContext } from '../context';
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

export default function board(key: string, context: LocalContext): boolean {
    const {player} = context;
    const movement = getMovement(key);
    let processed = !!(movement[0] || movement[1]);

    player.movement.x = movement[0];
    player.movement.y = movement[1];
    player.lastMovement = getLastMovement(key);

    return processed;
};

