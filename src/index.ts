import dotenv from 'dotenv';
dotenv.config();

import * as blessed from 'blessed';

import System from './systems/System';
import { MapLayout }from './server/commands';
import createRenderSystem from './systems/ClientRenderSystem';
import createMovementSystem from './systems/ClientMovementSystem';
import getEvents, {EventData, Run} from './events';
import captureInput from './input/index';
import createMainMenu from './screen/main-menu';

import Player from './objects/player';
import ClientSocket from './client-socket';
import EntityStore from './entities';
import GlobalContext from './context';
import Board from './board';

let movement;
let renderer;

const systems: System[] = [];
function loop(eventData: Run) {
    const then = Date.now();
    systems.forEach(s => {
        s.run(eventData);
    });

    console.error("TimeToRender", Date.now() - then);
}

try {
    const events = getEvents();
    const screen = blessed.screen({
        smartCSR: true
    });

    screen.title = 'Vim Royale';

    process.on('uncaughtException', function(err) {
        console.error(err.message);
        console.error(err.stack);

    });

    GlobalContext.socket = new ClientSocket()
    captureInput(screen);
    createMainMenu(systems, screen);

    events.on(evt => {
        switch (evt.type) {
            case "start-game":
                createMainGame(evt.data.map, evt.data.position);
                break;
        }
    });
    // The intro.

    function createMainGame(boardData: MapLayout, startingPosition: [number, number]) {
        const board = new Board(boardData.map);
        const player = new Player(startingPosition[0], startingPosition[1], '@');

        GlobalContext.player = player;
        GlobalContext.screen = "board";

        renderer = createRenderSystem(screen, board);
        movement = createMovementSystem(board);

        systems.push(movement);
        systems.push(renderer);

        GlobalContext.socket.createEntity(
            player.entity, player.position.x, player.position.y);

        events.on(function mainGameListener(evt: EventData) {
            switch (evt.type) {
                case "run":
                    loop(evt);
                    break;
            }
        });
    }
} catch (e) {
    console.error(e);
}

