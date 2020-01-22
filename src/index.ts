import * as blessed from 'blessed';

import createRenderSystem from './systems/RenderSystem';
import createMovementSystem from './systems/MovementSystem';
import getEvents, {EventData} from './events';
import captureInput from './input/index';

import Player from './objects/player';
import EntityStore from './entities';
import GlobalContext from './context';
import Board from './board';

let movement;
let renderer;

function loop(eventData: EventData) {
    const then = Date.now();
    movement.run(eventData);
    renderer.run(eventData);
    console.error("TimeToRender", Date.now() - then);
}

try {
    const events = getEvents();
    const screen = blessed.screen({
        smartCSR: true
    });

    screen.title = 'Vim Royale';

    const map = {
        width: 1000,
        height: 1000,
    };

    const board = new Board(map.width, map.height);
    const player = new Player(150, 150, '@');

    GlobalContext.player = player;
    GlobalContext.screen = "board";

    renderer = createRenderSystem(screen, board);
    movement = createMovementSystem(board);

    events.on(function(eventData: EventData) {

        if (eventData.type === 'run') {
            loop(eventData);
        }
    });

    captureInput(screen);

    process.on('uncaughtException', function(err) {
        console.error(err.message);
        console.error(err.stack);

    });
} catch (e) {
    console.error(e);
}

