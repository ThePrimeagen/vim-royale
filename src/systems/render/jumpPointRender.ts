import Board from "../../board";
import PositionComponent from "../../objects/components/position";
import {Renderer} from "./types";
import StyledCharacterStrategy from "../../characters/styled";

export default function jumpPointRenderer(board: Board, render: Renderer) {

    // TODO: Make this better by creating a quad tree and using the position
    // of the player to select out what to send to the next render function.
    const jumpPositions: PositionComponent[] = [];
    for (let y = 0; y < board.height; ++y) {
        for (let x = 0; x < board.width; ++x) {
            const char = board.jumpLetters[y][x];
            if (char) {
                const styles = new StyledCharacterStrategy(char, {
                    bold: true,
                    fg: '999999',
                });

                jumpPositions.push(new PositionComponent(
                    styles, x, y
                ));
            }
        }
    }

    return function _render(
        board: Board,
        renderSpace: string[][],
        positions: PositionComponent[][],
        playerPosition: PositionComponent,
        display: {width: number, height: number}): [string[][], number, number] {

        const tmp = [jumpPositions, ...positions];
        return render(board, renderSpace, tmp, playerPosition, display);
    };
}

