import Game from './';
import insert from './input/insert';

export default class GameController {
    private game: Game;
    constructor(game: Game) {
        this.game = game;
    }

    shootBullet(direction: string) {
        insert.handle(this.game.context, direction);
    }
};
