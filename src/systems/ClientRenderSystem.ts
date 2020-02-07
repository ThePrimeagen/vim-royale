import * as blessed from 'blessed';

import {GameOptions} from '../types';

import System from './System';
import {EventData} from '../events';
import getEntityStore from '../entities';
import PositionComponent from '../objects/components/position';
import GlobalContext from '../context';

import Board from '../board';
import apply from './apply';

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
        const tmp = this.tmp;

        const player = GlobalContext.player;
        const {x, y} = player.position;
        const {width, height} = GlobalContext.display;

        // TODO: When the player is next to the wall, it shouldn't be offset by so far,
        // also render checking will be interesting... we could always go cheap
        // and just render everything that is full width / height away.
        let offsetX = width / 2;
        let offsetY = height / 2;

        if (x < offsetX) {
            offsetX = x;
        }

        if (y < offsetY) {
            offsetY = y;
        }

        const [
            renderX,
            renderY,
        ] = this.board.getMapByPlayersPerspective();

        apply(tmp, this.board.map, 0, 0, renderX, renderY);

        store.
            toArray(PositionComponent).

            // @ts-ignore
            filter((other: PositionComponent) => {
                const relativeX = other.x - x;
                const relativeY = other.y - y;

                return Math.abs(relativeX) < width &&
                    Math.abs(relativeY) < height;
            }).
            sort((a: PositionComponent, b: PositionComponent) => a.z - b.z).
            forEach((pos: PositionComponent) => {
                const relativeX = pos.x - x + offsetX;
                const relativeY = pos.y - y + offsetY;

                // TODO: Map world vs player world.... how do we do that?
                //
                apply(tmp, pos.char, relativeX, relativeY);
            });

        const coords = [x, y].toString().split('');
        apply(tmp, [coords], width - (coords.length + 1), 0);

        const out = tmp.map((x, i) => {
            return x.join('');
        });

        return out.join('');
    }
}

export default function createRenderer(screen: blessed.Widgets.Screen, board: Board) {
    return new RendererSystem(screen, board);
};



