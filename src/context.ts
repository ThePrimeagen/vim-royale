import Player from './objects/player';

type ScreenType = "board" | "input";

type GlobalContext = {
    display: {
        width: number;
        height: number;
    };

    screen: ScreenType;
    player: Player;
};

export default {
    display: {
        width: 80,
        height: 24,
    },
} as GlobalContext;

