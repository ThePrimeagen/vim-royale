export default function getMovement(ch: string) {
    const outArr = [0, 0];
    switch (ch) {
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
    return outArr;
}

