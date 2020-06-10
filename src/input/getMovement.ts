import { InputCommand } from "../types";

export default function getMovement(ch: InputCommand) {
    const outArr = [0, 0];

    switch (ch.key) {
        case 'h':
            outArr[0] = -1;
            break;

        case 'l':
            outArr[0] = 1;
            break;

        case 'j':
            outArr[1] = 1;
            break;

        case 'k':
            outArr[1] = -1;
            break;
    }

    for (let i = 0; i < outArr.length; ++i) {
        outArr[i] *= ch.count;
    }

    return outArr;
}

