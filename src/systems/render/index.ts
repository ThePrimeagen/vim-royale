import PositionComponent from "../../objects/components/position";
import apply from "./apply";
import getRenderBounds from "./get-render-bounds";
import isInWindow from "./is-in-window";
import makeRelative from "./make-relative";
import GlobalContext from "../../context";
import Board from "../../board";

const tmp: PositionComponent[] = [];

export default function render(
    board: Board,
    renderSpace: string[][],
    positions: PositionComponent[],
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
    const hEnd = GlobalContext.display.height + playerPosition.y;
    const wEnd = GlobalContext.display.width + playerPosition.x;

    // TODO: Don't care, client
    // TODO: I do slightly care that I am creating all this nasty garbage
    // TODO: I do actually really care, this is terrible.  This is really
    // terrible bad, no good, at all
    const startHeight = Math.max(playerPosition.y - hEnd, 0);
    const startWidth = Math.max(playerPosition.x - wEnd, 0);

    for (let y = startHeight; y < hEnd && y < board.height; ++y) {
        for (let x = startWidth; x < wEnd && x < board.width; ++x) {
            const char = board.jumpLetters[y][x];
            if (char) {
                tmp.push(new PositionComponent(
                    char, x, y
                ));
            }
        }
    }

    // 1. apply the game board to the renderSpace.
    // 1.b apply the game board jumpletters to the renderSpace.
    // 2. draw positions
    // 3. draw player
    //
    // 1.
    apply(renderSpace, board.map, 0, 0, leftX, leftY);

    // 2.
    tmp.concat(positions).
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
        });

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

