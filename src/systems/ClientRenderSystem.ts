import * as blessed from 'blessed';

import PositionComponent from '../objects/components/position';
import GlobalContext, {LocalContext} from '../context';

import getBox from '../util/getBox';
import Board from '../board';
import apply from './render/apply';
import render from './render';
import { Renderer } from './render/types';
import jumpPointRenderer from './render/jumpPointRender';

export default class RendererSystem {
    private rendererer: Renderer;
    private screen: blessed.Widgets.Screen;
    private board: Board;
    private context: LocalContext;
    private box: blessed.Widgets.BoxElement;
    private tmp: string[][];

    private actual: string[][];

    constructor(screen: blessed.Widgets.Screen, board: Board, context: LocalContext) {
        this.screen = screen;
        this.board = board;
        this.context = context;
        this.tmp = [];
        this.actual = [];
        this.rendererer = jumpPointRenderer(board, render);

        const {width, height} = GlobalContext.display;

        for (let y = 0; y < height; ++y) {
            this.tmp[y] = new Array(width).fill('');
            this.actual[y] = new Array(width + GlobalContext.display.widthOffset).fill('');
        }

        // TODO: Stop being lazy about copying...
        // Also you really don't need to swap.  This is stupid
        this.box = getBox({
            top: 0,
            left: 0,
            width: GlobalContext.display.width + 2 + GlobalContext.display.widthOffset,
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

    fillInNumbering(offsetY: number) {
        const midPoint = Math.floor(GlobalContext.display.height / 2);

        // TODO: This is really lame, but its also the client, so I don't care
        for (let i = 0; i < this.tmp.length; ++i) {
            let char = String(Math.abs(midPoint + offsetY - i)).split('');

            if (char.length !== 2) {
                char.push(' ');
            }

            this.actual[i][0] = char[0];
            this.actual[i][1] = char[1];
            this.actual[i][2] = "|";
        }
    }

    run(diff: number) {
        this.box.setContent(this.renderToString());
        this.screen.render();
        // TODO: Is this actually bad?
        //this.context.dirty = false;
    }

    // TODO: Does this even matter in a CLI game?
    private renderToString(): string {
        const display = GlobalContext.display;
        const pPosition = this.context.player.position;
        const positions = this.context.store.toArray<PositionComponent>(PositionComponent);

        // APPLY THAT GAME BOARD
        const [
            tmp,
            _,
            offsetY,
        ] = this.rendererer(this.board, this.tmp, [positions], pPosition, display)

        const coords = [pPosition.x, pPosition.y].toString().split('');
        apply(tmp, [coords], display.width - (coords.length + 1), 0);
        apply(this.actual, tmp, GlobalContext.display.widthOffset, 0);

        this.fillInNumbering(offsetY);

        // TODO: Stop generating garbage
        return this.actual.
            map(line => line.join('')).
            join('');
    }
}

