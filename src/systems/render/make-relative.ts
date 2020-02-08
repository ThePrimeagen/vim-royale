
// TODO: Can we not generate garbage and assume that this value will be used
// only in the stack?
export default function makeRelative(leftX: number, leftY: number, x: number, y: number): [number, number] {
    const out: [number, number] = [0, 0];

    out[0] = x - leftX;
    out[1] = y - leftY;

    return out;
}

