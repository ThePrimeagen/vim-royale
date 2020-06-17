import PositionComponent from "../../objects/components/position";
import apply from "./apply";
import getRenderBounds from "./get-render-bounds";
import isInWindow from "./is-in-window";
import makeRelative from "./make-relative";
import Board from "../../board";

const tmp: PositionComponent[] = [];

export default function render(
    board: Board,
    renderSpace: string[][],
    positions: PositionComponent[][],
    playerPosition: PositionComponent,
    display: {width: number, height: number}): [string[][], number, number] {

    const {x, y} = playerPosition;
    const [
        leftX,
        leftY,
        offsetX,
        offsetY,
    ] = getRenderBounds(board.map, display.width, display.height, x, y);

    tmp.length = 0;

    // 1. apply the game board to the renderSpace.
    // 1.b apply the game board jumpletters to the renderSpace.
    // 2. draw positions
    // 3. draw player
    //
    // 1.
    apply(renderSpace, board.map, 0, 0, leftX, leftY);

    // 2.
    positions.forEach(p => p.
        filter(pos => {
            const {
                x, y
            } = pos;

            return pos.absolute ||
                isInWindow(leftX, leftY, display.width, display.height, x, y);
        }).
        sort((a, b) => a.z - b.z).
        forEach(pos => {
            const [
                x,
                y,
            ] = makeRelative(leftX, leftY, pos);
            apply(renderSpace, pos.char, x, y, 0, 0);
        })
    );

    // 3. draw player.
    const [
        relX,
        relY,
    ] = makeRelative(leftX, leftY, playerPosition);

    apply(renderSpace, playerPosition.char, relX, relY, 0, 0);

    return [
        renderSpace,
        offsetX,
        offsetY,
    ];
};

