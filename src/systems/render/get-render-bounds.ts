import getViewArea from './internals/get-view-area';
export type Quatuple = [number, number, number, number];

export default function getRenderBounds(map: string[][], width: number, height: number, x: number, y: number): Quatuple  {
    let [
        leftBoundX,
        leftBoundY,
        rightBoundX,
        rightBoundY,
    ] = getViewArea(width, height, x, y);

    let offsetX = 0;
    let offsetY = 0;

    // Do not need to adjust right side.
    if (leftBoundX < 0) {
        offsetX = leftBoundX;
        leftBoundX = 0;
    }

    if (rightBoundX >= map[0].length) {
        offsetX = rightBoundX - map[0].length;
        leftBoundX -= rightBoundX - (map[0].length - 1);
    }

    if (leftBoundY < 0) {
        offsetY = leftBoundY;
        leftBoundY = 0;
    }

    if (rightBoundY >= map.length) {
        offsetY = rightBoundY - map.length + ((height & 0x1) === 0 ? 0 : 1);
        leftBoundY -= rightBoundY - (map.length - 1);
    }

    return [
        leftBoundX,
        leftBoundY,

        // offset of the player from center
        offsetX,
        offsetY,
    ];
};

