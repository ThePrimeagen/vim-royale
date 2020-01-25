import GlobalContext from '../context';
import PositionComponent from '../objects/components/position';

export default function confirmMovement(pos: PositionComponent) {
    // TODO: I know that I just updated the player, this seems a bit
    // wack
    if (GlobalContext.player.position !== pos) {
        return;
    }

}


