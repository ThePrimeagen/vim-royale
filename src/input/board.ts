import getEvent from '../events';
import GlobalContext from '../context';

export default function board(key: string): boolean {
    const {player} = GlobalContext;

    let processed = true;
    switch (key) {
        case 'h':
            player.movement.x = -1;
            break;

        case 'l':
            player.movement.x = 1;
            break;

        case 'j':
            player.movement.y = -1;
            break;

        case 'k':
            player.movement.y = 1;
            break;

        default:
            processed = false;
            break;
    }

    return processed;
};

