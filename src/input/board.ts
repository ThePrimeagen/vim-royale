import getEvent from '../events';
import GlobalContext from '../context';
import getMovement from './getMovement';

export default function board(key: string): boolean {
    const {player} = GlobalContext;
    const movement = getMovement(key);
    let processed = !!(movement[0] || movement[1]);

    player.movement.x = movement[0];
    player.movement.y = movement[1];

    return processed;
};

