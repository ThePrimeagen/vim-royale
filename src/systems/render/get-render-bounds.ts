import getViewArea from './internals/get-view-area';

export default function getRenderBounds(map: string[][], width: number, height: number, x: number, y: number): [number, number] {
    let [
        leftBoundX,
        leftBoundY,
        rightBoundX,
        rightBoundY,
    ] = getViewArea(width, height, x, y);

    // Do not need to adjust right side.
    if (leftBoundX < 0) {
        leftBoundX = 0;
    }

    if (rightBoundX >= map[0].length) {
        leftBoundX -= rightBoundX - (map[0].length - 1);
    }

    if (leftBoundY < 0) {
        leftBoundY = 0;
    }

    if (rightBoundY >= map.length) {
        leftBoundY -= rightBoundY - (map.length - 1);
    }

    return [leftBoundX, leftBoundY];
};

