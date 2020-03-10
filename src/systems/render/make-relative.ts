import PositionComponent from "../../objects/components/position";

// TODO: Can we not generate garbage and assume that this value will be used
// only in the stack?
export default function makeRelative(leftX: number, leftY: number, pos: PositionComponent): [number, number] {
    const {
        x, y,
    } = pos;
    const out: [number, number] = [x, y];

    if (!pos.absolute) {
        out[0] -= leftX;
        out[1] -= leftY;
    }

    return out;
}

