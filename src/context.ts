import Player from './objects/player';

type ScreenType = "board" | "input";

type GlobalContext = {
    map: {
        width: number;
        height: number;
    };

    screen: ScreenType;
    player: Player;
};

export default {
    map: {
        width: 80,
        height: 24,
    }
} as GlobalContext;

