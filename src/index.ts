import * as blessed from 'blessed';

import createRenderSystem from './systems/RenderSystem';
import createMovementSystem from './systems/MovementSystem';
import getEvents, {EventData} from './events';
import captureInput from './input/index';

import Player from './objects/player';
import EntityStore from './entities';
import GlobalContext from './context';

const events = getEvents();
const screen = blessed.screen({
    smartCSR: true
});

screen.title = 'Vim Royale';

const map = {
    width: 80,
    height: 24,
};

const renderer = createRenderSystem(screen, map);
const movement = createMovementSystem();

// Entity player?
const player = new Player(15, 15, '@');
GlobalContext.player = player;
GlobalContext.screen = "board";

function loop(eventData: EventData) {
    movement.run(eventData);
    renderer.run(eventData);
}

events.on(function(eventData: EventData) {
    console.error("Emitting Event run", eventData);

    if (eventData.type === 'run') {
        loop(eventData);
    }
});

captureInput(screen);

process.on('uncaughtException', function(err) {
    console.error("Hello world");
    console.error(err.message);
    console.error(err.stack);
});

