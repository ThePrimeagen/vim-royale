import Player from './objects/player';
import ClientSocket from './client-socket';

type ScreenType = "board" | "input" | "main-menu";

type GlobalContext = {
    display: {
        width: number;
        height: number;
    };

    screen: ScreenType;
    player: Player;
    socket: ClientSocket
};

export default {
    display: {
        width: 80,
        height: 24,
    },

} as GlobalContext;

