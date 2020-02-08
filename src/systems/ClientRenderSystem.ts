import * as blessed from 'blessed';

import {GameOptions} from '../types';

import System from './System';
import {EventData} from '../events';
import getEntityStore from '../entities';
import PositionComponent from '../objects/components/position';
import GlobalContext from '../context';

import Board from '../board';
import apply from './render/apply';
import getRenderBounds from './render/get-render-bounds';
import makeRelative from './render/make-relative';
import render from './render';

const store = getEntityStore();

class RendererSystem implements System {
    private screen: blessed.Widgets.Screen;
    private board: Board;
    private box: blessed.Widgets.BoxElement;
    private tmp: string[][];

    constructor(screen: blessed.Widgets.Screen, board: Board) {
        this.screen = screen;
        this.board = board;
        this.tmp = [];
        const {width, height} = GlobalContext.display;

        for (let x = 0; x < width; ++x) {
            for (let y = 0; y < height; ++y) {
                if (!this.tmp[y]) {
                    this.tmp[y] = [];
                }
                this.tmp[y][x] = '';
            }
        }

        // TODO: Stop being lazy about copying...
        // Also you really don't need to swap.  This is stupid

        this.box = blessed.box({
            top: 0,
            left: 0,
            width: GlobalContext.display.width + 2,
            height: GlobalContext.display.height + 2,

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

    run(e: EventData) {
        this.box.setContent(this.renderToString());
        this.screen.render();
    }

    // TODO: Does this even matter in a CLI game?
    private renderToString(): string {
        const display = GlobalContext.display;
        const pPosition = GlobalContext.player.position;
        const positions = store.toArray<PositionComponent>(PositionComponent);

        // APPLY THAT GAME BOARD
        const tmp = render(this.board.map, this.tmp, positions, pPosition, display);

        const coords = [pPosition.x, pPosition.y].toString().split('');
        apply(tmp, [coords], display.width - (coords.length + 1), 0);

        return tmp.
            map(line => line.join('')).
            join('');
    }
}

export default function createRenderer(screen: blessed.Widgets.Screen, board: Board) {
    return new RendererSystem(screen, board);
};



