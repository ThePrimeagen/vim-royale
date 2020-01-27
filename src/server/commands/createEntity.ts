import { FrameType } from './types';

enum Type {
    Player = 0x0,
};

const dataB = Buffer.alloc(4);
const dataV = new DataView(dataB);

// How to encode this ?
// TODO: Bullets, they need to have direction, all of taht....
// | FrameType : 1 | Type : 1 | x : 2 | y : 2 |
export default function createEntity(type: Type, x: number, y: number): Buffer {
    const b = Buffer.allocUnsafe(6);

    b[0] = FrameType.CreateEntity;
    b[1] = type;

    dataV.setUint16(0, x);
    b[2] = dataB[0];
    b[3] = dataB[1];

    dataV.setUint16(0, y);
    b[4] = dataB[0];
    b[5] = dataB[1];

    return b;
};

