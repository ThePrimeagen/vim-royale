import Board from '../board';
import getEntities from '../entities';

const store = getEntities();

export default class ServerGame {
    private board: Board;

    constructor(board: Board) {
        this.board = board;
    }

    // We don't need
    update() {
    }
}


