export default function apply(
    swap: string[][], toWrite: string[][],
    swapX: number = 0, swapY: number = 0,
    toWriteX: number = 0, toWriteY: number = 0
) {
    for (let y = 0; y + toWriteY < toWrite.length && y + swapY < swap.length; ++y) {

        // Relying on empty chars to not be written.
        for (let x = 0; x + toWriteX < toWrite[y + toWriteY].length && x + swapX < swap[y + swapY].length; ++x) {
            const char = toWrite[y + toWriteY][x + toWriteX];
            if (char) {
                swap[y + swapY][x + swapX] = char;
            }
        }

    }
}

