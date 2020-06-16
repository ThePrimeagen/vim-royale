import GlobalContext from "../context";
import { generateJumps } from "./jumps";

const whiteSpace = '\u202F';

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
        return new Board(map, generateJumps(width, height));
    }
}

