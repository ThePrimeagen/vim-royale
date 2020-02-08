const out = [];
export default function getViewArea(width: number, height: number, x: number, y: number) {
    const halfWidth = Math.floor(width / 2);
    const widthAdjustment = width % 2 === 0 ? 1 : 0;

    const halfHeight = Math.floor(height / 2);
    const heightAdjustment = height % 2 === 0 ? 1 : 0;

    // Near the walls.
    let leftBoundX = x - halfWidth + widthAdjustment;
    let rightBoundX = x + halfWidth;
    let leftBoundY = y - halfHeight + heightAdjustment;
    let rightBoundY = y + halfHeight;

    // PROBABLY PREMATURE OPTI
    out[0] = leftBoundX;
    out[1] = leftBoundY;
    out[2] = rightBoundX;
    out[3] = rightBoundY;

    return out;
};

