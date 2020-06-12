import {randomInBetween} from "./util/random";
import GlobalContext from "./context";

const whiteSpace = '\u202F';

const NODE_COUNT: number = +process.env.JUMP_COUNT_PER_SCREEN;
const MAX_SEEN_COUNT : number = 5;
const MAX_SEEN_LETTER_COUNT : number = 25;
const LETTER_LIST = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

function getUniqueChar(seenBefore: string[]): string {
    let tries = 0;
    let retVal = "";

    do {
        retVal = LETTER_LIST[Math.floor(Math.random() * LETTER_LIST.length)];
    } while (++tries < 10 && ~seenBefore.indexOf(retVal));

    return retVal
}

function getUnique(start: number, stop: number, seenBefore: number[]): number {
    let tries = 0;
    let retVal = 0;

    do {
        retVal = randomInBetween(start, stop);
    } while (++tries < 10 && ~seenBefore.indexOf(retVal));

    return retVal
}

export default class Board {
    public readonly width: number;
    public readonly height: number;

    public map: string[][];
    public jumpLetters: string[][];

    constructor(boardData: string[][], jumpLetters: string[][]) {
        this.map = boardData;
        this.jumpLetters = jumpLetters;

        this.height = this.map.length;
        this.width = this.map[0].length;
    }

    static generate(width: number, height: number): Board {
        const map = [];
        const screenWidth = GlobalContext.display.width;
        const screenHeight = GlobalContext.display.height;

        for (let i = 0; i < width; ++i) {
            for (let j = 0; j < height; ++j) {
                if (!map[j]) {
                    map[j] = [];
                }

                if (i === 0 || j === 0 || i === width - 1 || j === height - 1) {
                    map[j][i] = 'x';
                }
                else {
                    map[j][i] = whiteSpace;
                }
            }
        }

        // create a graph with screen size nodes.
        // Also containing 50% offset nodes.
        //
        // Starting at the upper left hand, add floor(1/4N) nodes to it.  Then
        // keep moving to each node, bfstyle.
        //
        //

        type VisitNode = [number, number];
        const nodesToVisit: VisitNode[] = [];
        const characterPositions: string[][] = new Array(height).
            fill('').
            map(l => {
                return new Array(width).fill('');
            });

        for (let offsetH = Math.floor(-screenHeight / 2),
             h = 0; offsetH < height; offsetH += screenHeight, h += screenHeight) {

            for (let offsetW = Math.floor(-screenWidth / 2),
                 w = 0; offsetW < width; offsetW += screenWidth, w += screenWidth) {

                nodesToVisit.push([offsetW, offsetH]);
                if (w < width && h < height) {
                    nodesToVisit.push([w, h]);
                }
            }
        }

        const lastXs: number[] = [];
        const lastYs: number[] = [];
        const seenChars: string[] = [];

        do {

            const node = nodesToVisit.pop();
            let denom = 1;
            let nodeX = node[0];
            let nodeY = node[1];
            let nodeW = screenWidth;
            let nodeH = screenHeight;

            if (nodeX < 0) {
                nodeX = 0;
            }
            if (nodeY < 0) {
                nodeY = 0;
            }

            if (nodeX + screenWidth > width) {
                denom = denom << 1;
                nodeW = width - Math.abs(width - (nodeX + screenWidth));
            }

            if (nodeY + screenHeight > height) {
                denom = denom << 1;
                nodeH = height - Math.abs(height - (nodeY + screenHeight));
            }

            let nodePlacements = Math.floor(NODE_COUNT / denom);
            do {

                const x: number = getUnique(nodeX, nodeW, lastXs);
                const y: number = getUnique(nodeY, nodeH, lastYs);
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

                characterPositions[y][x] = letter;

            } while (--nodePlacements);

        } while (nodesToVisit.length);

        return new Board(map, characterPositions);
    }
}

