import { FrameType } from './types';

const dataB = Buffer.alloc(4);
const dataV = new DataView(dataB);

// How to encode this ?
// TODO: Bullets, they need to have direction, all of taht....
// | FrameType : 1 | x : 2 | y : 2 |
export default function createUpdatePosition(x: number, y: number): Buffer {
    const b = Buffer.allocUnsafe(5);

    b[0] = FrameType.UpdatePosition;

    dataV.setUint16(0, x);
    b[1] = dataB[0];
    b[2] = dataB[1];

    dataV.setUint16(0, y);
    b[3] = dataB[0];
    b[4] = dataB[1];

    return b;
};


