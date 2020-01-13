import * as blessed from 'blessed';

import {GameOptions} from './types';
import {ObjectInfo} from './objects/types';

class Renderer {
    private width: number;
    private height: number;
    private terminal: string[][];
    private player: ObjectInfo;
    private objects: ObjectInfo[];
    private screen;
    private box: blessed.Widgets.BoxElement;
    private swaps: string[][][];
    private swapsIdx: number;

    constructor(screen, opts: GameOptions = {
        width: 80,
        height: 24,
    }) {
        this.width = opts.width;
        this.height = opts.height;
        this.screen = screen;
        this.swapsIdx = 0;
        this.swaps = [];
        this.objects = [];

        this.terminal = [];
        for (let i = 0; i < this.height; ++i) {
            this.terminal.push(new Array(this.width).fill('_'));
        }

        this.swaps.push(JSON.parse(JSON.stringify(this.terminal)));
        this.swaps.push(JSON.parse(JSON.stringify(this.terminal)));

        this.box = blessed.box({
            top: 0,
            left: 0,
            width: this.width,
            height: this.height,

            content: this.renderToString(),
            tags: true,
            border: {
                type: 'bg'
            },
        });

        // Render the screen.
        screen.append(this.box);
        screen.render();
    }

    addPlayer(obj: ObjectInfo) {
        this.player = obj;
    }

    addObject(obj: ObjectInfo) {
        this.objects.push(obj);
    }

    render() {
        this.box.setContent(this.renderToString());
        this.screen.render();
    }

    // TODO: Does this even matter in a CLI game?
    private renderToString(): string {
        const swapToUse = this.swaps[++this.swapsIdx % 2];
        this.apply(swapToUse, this.terminal);
        this.appylyObjects(swapToUse);

        if (this.player) {
            this.apply(swapToUse, [[this.player.char]], this.player.x, this.player.y);
        }


        return swapToUse.map(x => x.join('')).join('');
    }

    private appylyObjects(swap: string[][]) {
        this.objects.forEach(obj => {
            // TODO: LICK THE PERFORMANCE
            this.apply(swap, [[obj.char]], obj.x, obj.y);
        });
    }

    private apply(swap: string[][], toWrite: string[][], offsetX: number = 0, offsetY: number = 0) {
        for (let i = 0; i < toWrite.length; ++i) {
            for (let j = 0; j < toWrite[i].length; ++j) {
                swap[i + offsetY][j + offsetX] = toWrite[i][j];
            }
        }
    }
}

export default function createRenderer(screen, opts?: GameOptions) {
    return new Renderer(screen, opts);
};



