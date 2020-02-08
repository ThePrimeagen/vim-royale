import getViewArea from './internals/get-view-area';

export default function isInWindow(
    leftX: number, leftY: number, width: number,
    height: number, x: number, y: number) {

    return (leftX <= x && leftX + width > x) &&
        (leftY <= y && leftY + height > y);
};
