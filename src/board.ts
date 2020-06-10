const whiteSpace = '\u202F';

export default class Board {
    public readonly width: number;
    public readonly height: number;

    public map: string[][];

    constructor(boardData: string[][]) {
        this.map = boardData;
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

        return new Board(map);
    }
}



