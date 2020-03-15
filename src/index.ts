import dotenv from "dotenv";
dotenv.config();

import * as blessed from "blessed";

import PositionComponent from "./objects/components/position";
import { StartGameMessage } from "./server/commands";
import { isCorrectPosition, readCorrectPosition } from "./server/messages/correctPosition";
import { isGameStateUpdate, readGameStateUpdate } from "./server/messages/game-state-update";
import { MapLayout }from "./server/commands";
import LifetimeSystem from "./systems/LifetimeSystem";
import VelocitySystem from "./systems/VelocitySystem";
import RendererSystem from "./systems/ClientRenderSystem";
import MovementSystem from "./systems/ClientMovementSystem";
import getEvents, {Events, EventType, BinaryData, EventData, Run} from "./events";
import captureInput from "./input/index";
import createMainMenu from "./screen/main-menu";
import createLogger, {setLogger, flush} from "./logger";
import errorLogger from "./logger/console.error";
import logLogger from "./logger/console.log";
import handleBinaryMessage from "./updates";

import Player from "./objects/player";
import Mode from "./objects/mode";
import ClientSocket from "./client-socket";
import getEntityStore, {EntityStore} from "./entities";
import GlobalContext, {ScreenType, LocalContext, createLocalContext} from "./context";
import Board from "./board";
import getNextLoop from './util/getNextLoop';

if (process.env.LOGGER_TYPE === "log") {
    setLogger(logLogger);
}
else {
    setLogger(errorLogger);
}

const logger = createLogger("Game");

type GameConfig = {
    port: number;
    host: string;
    context: LocalContext;
    tick: number;
};

type Callback = () => void;
type GameCBs = {
    connected: Callback[];
    gameStart: Callback[];
}

let id = 0;
export default class Game {
    public context: LocalContext;

    private tick: number;
    private boundedLoop: () => void;
    private velocity: VelocitySystem;
    private lifetime: LifetimeSystem;
    private movement: MovementSystem;
    private renderer: RendererSystem;
    private store: EntityStore;
    private events: Events;
    private player: Player;
    private board: Board;
    private screen: blessed.Widgets.Screen;
    private callbacks: GameCBs;
    private id: number;
    private on: (evt: EventData, ...args: any[]) => void;

    constructor(screen: blessed.Widgets.Screen, {
        host,
        port,
        context,
        tick,
    }: GameConfig) {
        this.id = id++;

        context.store = this.store = getEntityStore();
        context.events = this.events = getEvents();
        context.socket = new ClientSocket(host, port, context);

        // TODO: What do I need to do with you?
        const mode = new Mode(context);

        logger("Constructing the game", this.id, context.socket.id);

        this.callbacks = {
            connected: [],
            gameStart: [],
        };

        this.screen = screen;
        this.context = context;
        this.tick = tick;

        createMainMenu(screen, this.context);

        this.on = (evt, ...args) => {
            logger("Received Event", this.id, evt.type);
            switch (evt.type) {
                case EventType.StartGame:
                    this.createMainGame(evt.data);
                    this.callbacks.gameStart.forEach(cb => cb());
                    break;

                case EventType.WsBinary:
                    handleBinaryMessage(this.context, evt);
                    break;

                case EventType.WsOpen:
                    this.callbacks.connected.forEach(cb => cb());
                    break;
            }
        };

        this.events.on(this.on);
        this.boundedLoop = this.loop.bind(this);
    }

    public onGameStart(cb: () => void) {
        logger("onGameStart", this.id);
        this.callbacks.gameStart.push(cb);
    }

    public onConnected(cb: () => void) {
        logger("onConnected", this.id);
        this.callbacks.connected.push(cb);
    }

    private createMainGame(data: StartGameMessage) {
        logger("createMainGame", this.id, this.context.socket.id, data.entityIdRange, data.position);

        this.board = new Board(data.map.map);
        this.store.setEntityRange(data.entityIdRange[0], data.entityIdRange[1]);

        const [
            playerX,
            playerY,
        ] = data.position;
        this.player = new Player(playerX, playerY, "@", this.context);

        this.context.player = this.player;
        this.context.screen = ScreenType.Normal;

        this.renderer = new RendererSystem(this.screen, this.board, this.context);
        this.movement = new MovementSystem(this.board, this.context);
        this.velocity = new VelocitySystem(this.context);
        this.lifetime = new LifetimeSystem(this.context);

        this.context.socket.createEntity(
            this.player.entity, this.player.position.x, this.player.position.y);

        this.loop();
    }

    public shutdown() {
        logger("shutdown");
        flush();
        this.events.off(this.on);
        this.context.socket.shutdown();
    }

    private loopCount: number = 0;
    private loopLastCalled: number = 0;
    private loop() {
        const then = Date.now();
        const diff = this.loopLastCalled === 0 ? 0 : then - this.loopLastCalled;

        this.velocity.run(diff);
        this.movement.run(diff);
        this.renderer.run(diff);
        this.lifetime.run();

        if (++this.loopCount % 600 === 0) {
            logger("timer", Date.now() - then);
        }

        const now = this.loopLastCalled = Date.now();
        setTimeout(this.boundedLoop, getNextLoop(this.tick, now - then));
    }
}

if (require.main === module) {

    const screen = blessed.screen({
        smartCSR: true
    });

    screen.title = "Vim Royale";

    process.on("uncaughtException", function(err) {
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
        tick: +process.env.CLIENT_TICK,
    });
}

