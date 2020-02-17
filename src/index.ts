import dotenv from 'dotenv';
dotenv.config();

import * as blessed from 'blessed';

import PositionComponent from './objects/components/position';
import System from './systems/System';
import { StartGameMessage } from './server/commands';
import { isCorrectPosition, readCorrectPosition } from './server/messages/correctPosition';
import { isGameStateUpdate, readGameStateUpdate } from './server/messages/game-state-update';
import { MapLayout }from './server/commands';
import RendererSystem from './systems/ClientRenderSystem';
import MovementSystem from './systems/ClientMovementSystem';
import getEvents, {Event, EventType, BinaryData, EventData, Run} from './events';
import captureInput from './input/index';
import createMainMenu from './screen/main-menu';
import createLogger, {setLogger} from './logger';
import errorLogger from './logger/console.error';
import handleBinaryMessage from './updates';

import Player from './objects/player';
import ClientSocket from './client-socket';
import getEntityStore, {EntityStore} from './entities';
import GlobalContext, {LocalContext, createLocalContext} from './context';
import Board from './board';

setLogger(errorLogger);
const logger = createLogger("Game");

type GameConfig = {
    port: number;
    host: string;
    context: LocalContext;
};

type Callback = () => void;
type GameCBs = {
    connected: Callback[];
    gameStart: Callback[];
}

export default class Game {
    private movement: MovementSystem;
    private renderer: RendererSystem;
    private store: EntityStore;
    private events: Event;
    private player: Player;
    private context: LocalContext;
    private board: Board;
    private screen: blessed.Widgets.Screen;
    private callbacks: GameCBs;
    private on: (evt: EventData, ...args: any[]) => void;

    constructor(screen: blessed.Widgets.Screen, {
        host,
        port,
        context,
    }: GameConfig) {

        context.store = this.store = getEntityStore();
        context.events = this.events = getEvents();
        context.socket = new ClientSocket(host, port, context);

        logger("Constructing the game");

        this.callbacks = {
            connected: [],
            gameStart: [],
        };

        this.screen = screen;
        this.context = context;

        createMainMenu(screen, this.context);

        this.on = (evt, ...args) => {
            logger("Received Event");
            switch (evt.type) {
                case EventType.StartGame:
                    this.callbacks.gameStart.forEach(cb => cb());
                    this.createMainGame(evt.data);
                    break;

                case EventType.WsBinary:
                    handleBinaryMessage(this.context, evt);
                    break;

                case EventType.Run:
                    this.loop(evt);
                    break;

                case EventType.WsOpen:
                    this.callbacks.connected.forEach(cb => cb());
                    break;
            }
        };

        this.events.on(this.on);
    }

    public onGameStart(cb: () => void) {
        logger("onGameStart");
        this.callbacks.gameStart.push(cb);
    }

    public onConnected(cb: () => void) {
        logger("onConnected");
        this.callbacks.connected.push(cb);
    }

    private createMainGame(data: StartGameMessage) {
        logger("createMainGame", data.entityIdRange, data.position);

        this.board = new Board(data.map.map);
        this.store.setEntityRange(data.entityIdRange[0], data.entityIdRange[1]);

        const [
            playerX,
            playerY,
        ] = data.position;
        this.player = new Player(playerX, playerY, '@', this.context);

        this.context.player = this.player;
        this.context.screen = "board";

        this.renderer = new RendererSystem(this.screen, this.board, this.context);
        this.movement = new MovementSystem(this.board, this.context);

        this.context.socket.createEntity(
            this.player.entity, this.player.position.x, this.player.position.y);
    }

    public shutdown() {
        logger("shutdown");
        this.events.off(this.on);
        this.context.socket.shutdown();
    }

    private loop(eventData: Run) {
        const then = Date.now();

        this.movement.run(eventData);
        this.renderer.run(eventData);

        logger("shutdown", Date.now() - then);
    }
}

if (require.main === module) {
    const screen = blessed.screen({
        smartCSR: true
    });
    screen.title = 'Vim Royale';

    process.on('uncaughtException', function(err) {
        logger(err.message);
        logger(err.stack);

        console.error(err.message);
        console.error(err.stack);
    });

    const context = createLocalContext();
    captureInput(screen, context);
    const game = new Game(screen, {
        context,
        port: +process.env.PORT,
        host: process.env.HOST,
    });
}

