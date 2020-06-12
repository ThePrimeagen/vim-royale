import {randomInBetween} from "../util/random";
import GlobalContext from "../context";

const MAX_SEEN_COUNT : number = 50;
const MAX_SEEN_LETTER_COUNT : number = 25;
const LETTER_LIST = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
const JUMP_COUNT_DIVISOR: number = +process.env.JUMP_COUNT_DIVISOR;

export function getUniqueChar(seenBefore: string[]): string {
    let tries = 0;
    let retVal = "";

    do {
        retVal = LETTER_LIST[Math.floor(Math.random() * LETTER_LIST.length)];
    } while (++tries < 10 && ~seenBefore.indexOf(retVal));

    return retVal
}

export function getUnique(start: number, stop: number, seenBefore: number[]): number {
    let tries = 0;
    let retVal = 0;

    do {
        retVal = randomInBetween(start, stop);
    } while (++tries < 10 && ~seenBefore.indexOf(retVal));

    return retVal
}

export function generateJumps(width: number, height: number): string[][] {
        type VisitNode = [number, number];
        const nodesToVisit: VisitNode[] = [];
        const characterPositions: string[][] = new Array(height).
            fill('').
            map(_ => {
                return new Array(width).fill('');
            });

        const yJump = Math.floor(GlobalContext.display.height / JUMP_COUNT_DIVISOR);
        const xJump = Math.floor(GlobalContext.display.width / JUMP_COUNT_DIVISOR);
        for (let y = 0; y < height; y += yJump) {
            for (let x = 0; x < width; x += xJump) {
                nodesToVisit.push([x, y]);
            }
        }

        const lastXs: number[] = [];
        const lastYs: number[] = [];
        const seenChars: string[] = [];

        do {
            const node = nodesToVisit.pop();
            let nodeX = node[0];
            let nodeY = node[1];

            const nodeXEnd = Math.min(nodeX + xJump, width - 1);
            const nodeYEnd = Math.min(nodeY + yJump, height - 1);

            const x: number = getUnique(nodeX, nodeXEnd, lastXs);
            const y: number = getUnique(nodeY, nodeYEnd, lastYs);
            const letter: string = getUniqueChar(seenChars);

            lastXs.push(x);
            lastYs.push(y);
            seenChars.push(letter);

            if (lastXs.length > MAX_SEEN_COUNT) {
                lastXs.shift();
            }

            if (lastYs.length > MAX_SEEN_COUNT) {
                lastYs.shift();
            }

            if (seenChars.length > MAX_SEEN_LETTER_COUNT) {
                seenChars.shift();
            }

            console.log("XX", y, characterPositions.length, x, characterPositions.length);
            characterPositions[y][x] = letter;

        } while (nodesToVisit.length);

    characterPositions.map(l => console.log("XX", JSON.stringify(l)));
    return characterPositions;
}
