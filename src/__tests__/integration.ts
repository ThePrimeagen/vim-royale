import dotenv from 'dotenv';
dotenv.config();

import util from 'util';
import * as blessed from 'blessed';

process.env.LOGGER_TYPE = 'log';
process.env.SUPPRESS_LOGS = 'true';

jest.doMock('blessed', () => {
    return {
        box: () => {
            return {
                setContent: jest.fn()
            };
        }
    };
});

import {LocalContext, createLocalContext} from '../context';
import Game from '../index';
import Server from '../server';
import {EventType} from '../events';
import {EntityStore} from '../entities';
import {FrameType} from '../server/messages/types';
import {
    gameIsConnected,
    gameIsReadyToPlay,
    serverIsListening,
    KeyListener,
    createScreen,
    findMovementListener,
} from './utils';

import createInput from '../input';
import PositionComponent from '../objects/components/position';
jest.setTimeout(5000);

describe("integration", function() {
    let server: Server, game: Game[];
    let port: number = 1336;

    beforeEach(async function() {
        port++;

        server = new Server({
            port,
            width: 200,
            height: 200,
            tick: 1000,
            entityIdRange: 1337,
        });

        //await util.promisify(server.onListening.bind(server))();
        await serverIsListening(server);

        game = [];
    });

    afterEach(function() {
        game.forEach(game => {
            game.shutdown();
        });

        server.shutdown();

        game = null;
        server = null;
    });

    function createGame(screen: blessed.Widgets.Screen, context: LocalContext = createLocalContext()): Game {
        const g = new Game(screen, {
            port,
            host: 'localhost',
            context,
        });
        game.push(g);
        return g;
    }

    function onServerUpdatePosition(count: number = 1) {
        return new Promise(res => {
            let c = 0;
            function onEvent(evt) {
                if (evt.type === EventType.WsBinary &&
                    evt.data[0] === FrameType.UpdatePosition) {

                    server.scs.update();

                    if (++c === count) {
                        server.scs.context.events.off(onEvent);
                        res();
                    }
                }
            };
            server.scs.context.events.on(onEvent);
        });
    }

    function getPositionComponent(store: EntityStore, entityId: number): PositionComponent {
        // @ts-ignore
        return store.getComponent<PositionComponent>(entityId, PositionComponent);
    }

    it("should start a game and a server", async function() {
        await gameIsConnected(createGame(createScreen()));
    });

    it("connect multiple games to one server.", async function() {
        const g1 = createGame(createScreen());
        const g2 = createGame(createScreen());

        await Promise.all([gameIsConnected(g1), gameIsConnected(g2)]);
    });

    it("move the player around.", async function() {
        const listeners = [];
        const context = createLocalContext();
        const screen = createScreen(listeners);
        const g1 = createGame(screen, context);

        const updates = onServerUpdatePosition(1);
        createInput(screen, context);

        await gameIsReadyToPlay(g1);

        const keyListener = findMovementListener(listeners);

        keyListener[1]('j');

        await updates;

        const sStore = server.scs.context.store;
        const gStore = g1.context.store;

        const serverEntities = sStore.getAllEntities();
        const clientEntities = gStore.getAllEntities();

        expect(serverEntities).toEqual(clientEntities);

        const serverPlayer = sStore.
            // @ts-ignore
            getComponent<PositionComponent>(0, PositionComponent);

        const clientPlayer = gStore.
            // @ts-ignore
            getComponent<PositionComponent>(0, PositionComponent);

        expect(serverPlayer.x).toEqual(clientPlayer.x);
        expect(serverPlayer.y).toEqual(clientPlayer.y);
    });

    it("move multiple players around.", async function() {
        const players = Array.from({length: 3}, () => {
            const listeners = [];
            const screen = createScreen(listeners);
            const context = createLocalContext();
            const g = createGame(screen, context);

            createInput(screen, context);

            return {
                listeners,
                screen,
                g,
                x: 0,
                y: 0,
            };
        });

        const updates = onServerUpdatePosition(12);

        await Promise.all(players.map(x => gameIsReadyToPlay(x.g)));

        // put the start on each player.
        players.forEach(player => {
            player.x = player.g.context.player.position.x;
            player.y = player.g.context.player.position.y;
        });

        const keyListeners = players.
            map(x => findMovementListener(x.listeners));

        for (let i = 0; i < 4; ++i) {
            keyListeners.forEach(listener => listener[1]('j'));
        }

        await updates;

        const sStore = server.scs.context.store;
        expect(sStore.getAllEntities()).toEqual([0, 1337, 1337 * 2]);

        players.forEach((x, i) => {
            const store = x.g.context.store;
            const sPos = getPositionComponent(sStore, i * 1337);
            expect(x.x).toEqual(sPos.x);
            expect(x.y + 4).toEqual(sPos.y);
        });
    });
});

