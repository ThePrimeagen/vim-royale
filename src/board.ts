import GlobalContext from './context';

function clamp(num: number, upperBounds: number): number {
    return Math.min(Math.max(num, 0), upperBounds - 1);
}

const whiteSpace = '\u202F';

export default class Board {
    private width: number;
    private height: number;

    public map: string[][];

    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
        this.map = [];
        const screen = GlobalContext.display;
        const halfWidth = Math.floor(screen.width / 2);
        const halfHeight = Math.floor(screen.height / 2);

        for (let i = 0; i < width; ++i) {
            for (let j = 0; j < height; ++j) {
                if (!this.map[j]) {
                    this.map[j] = [];
                }
                if (i === 0 || j === 0 || i === width - 1 || j === height - 1) {
                    this.map[j][i] = 'x';
                }
                else {
                    this.map[j][i] = whiteSpace;
                }
            }
        }
    }

    // TODO: How to do this with viewing someone else...
    public getMapByPlayersPerspective(): [number, number] {
        const {x, y} = GlobalContext.player.position;
        const {width, height} = GlobalContext.display;

        return [clamp(x - width / 2, this.width), clamp(y - height / 2, this.height)];
    }
}

