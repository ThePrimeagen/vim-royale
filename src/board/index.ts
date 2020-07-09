import GlobalContext from "../context";
import PositionComponent from "../objects/components/position";
import { generateJumps } from "./jumps";
import createLogger from "../logger";

const logger = createLogger("Board");

const whiteSpace = '\u202F';

// TODO(Garbage): due to object allocation with x and y)
const letters: JumpCoordinate[] = [];

export enum LookDirection {
    Left = 0,
    Right,
}

export type JumpCoordinate = {
    letter: string;
    position: {x: number, y: number};
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

    getBoundedY(x: number) {
        return Math.max(Math.min(x, this.width - 1), 0);
    }

    getBoundedX(x: number) {
        return Math.max(Math.min(x, this.width - 1), 0);
    }

    getLetters(position: PositionComponent, side: LookDirection): JumpCoordinate[] {
        const {
            display: { width },
        } = GlobalContext;

        const w = Math.ceil(width / 2);
        const lowerX = side === LookDirection.Left ?
            this.getBoundedX(position.x - w) : this.getBoundedX(position.x + 1);

        const higherX = side === LookDirection.Left ?
            this.getBoundedX(position.x - 1) : this.getBoundedX(position.x + w);

        letters.length = 0;
        const row = this.jumpLetters[position.y];
        for (let i = lowerX; i <= higherX; ++i) {
            if (row[i] !== "") {
                // TODO(Garbage): Pool these items for a sync pool.
                letters.push({
                    letter: row[i],
                    position: {x: i, y: position.y}
                });
            }
        }

        logger("getLetters", letters);
        return letters;
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

