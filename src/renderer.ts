import * as blessed from 'blessed';

import {GameOptions} from './types';

import getEntityStore from './entities';
import PositionComponent from './objects/components/position';

const store = getEntityStore();

class Renderer {
    private width: number;
    private height: number;
    private terminal: string[][];
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

        this.terminal = [];
        for (let i = 0; i < this.height; ++i) {
            this.terminal.push(new Array(this.width).fill('_'));
        }

        this.swaps.push(JSON.parse(JSON.stringify(this.terminal)));
        this.swaps.push(JSON.parse(JSON.stringify(this.terminal)));

        this.box = blessed.box({
            top: 0,
            left: 0,
            width: this.width + 2,
            height: this.height + 2,

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

    render() {
        this.box.setContent(this.renderToString());
        this.screen.render();
    }

    // TODO: Does this even matter in a CLI game?
    private renderToString(): string {
        const swapToUse = this.swaps[++this.swapsIdx % 2];
        this.apply(swapToUse, this.terminal);

        store.
            toArray(PositionComponent.type).
            sort((a: PositionComponent, b: PositionComponent) => a.z - b.z).
            forEach((pos: PositionComponent) => {
                // TODO: Map world vs player world.... how do we do that?
                //
                this.apply(swapToUse, pos.char, pos.x, pos.y);
            });

        const out = swapToUse.map(x => x.join(''));
        console.error('\n');
        console.error(out.join('\n'));
        console.error('\n');
        console.error('\n');
        console.error('\n');
        return out.join('');
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



