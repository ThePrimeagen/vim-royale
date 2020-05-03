import util from 'util';

import * as mockBlessed from 'blessed';
import GlobalContext, {LocalContext, createLocalContext} from '../context';
import Game from '../index';
import Server from '../server';
import {EventType, Events} from '../events';
import {EntityStore} from '../entities';
import {FrameType, GameStateType} from '../server/messages/types';
import {
    gameIsConnected,
    gameIsReadyToPlay,
    serverIsListening,
    KeyListener,
    createScreen,
    findMovementListener,
    toBlessedKeyEvent,
    getMovementFromDir,
} from './_utils';

import createInput from '../input';
import PositionComponent from '../objects/components/position';
jest.setTimeout(5000);

describe("integration", function() {
    let server: Server, game: Game[];
    let port: number = 25000;
    const onLinks: any[] = [];

    async function startServer(optionalStartingPositions?: [number, number][]) {
        port++;

        server = new Server({
            port,
            width: 200,
            height: 200,
            tick: 1000,
            entityIdRange: 1337,
            optionalStartingPositions
        });

        //await util.promisify(server.onListening.bind(server))();
        await serverIsListening(server);

        game = [];
    }

    afterEach(function() {
        game.forEach(game => {
            game.shutdown();
        });

        server.shutdown();

        game = null;
        server = null;
    });

    function createGame(screen: any, context: LocalContext = createLocalContext()): Game {
        const g = new Game(screen, {
            port,
            host: 'localhost',
            context,
            tick: 1000,
        });
        game.push(g);
        return g;
    }

    let onClientId = 0;
    function onClientUpdatePosition(events: Events, count: number = 1) {
        const id = ++onClientId;
        return new Promise(res => {
            let c = 0;
            function onEvent(evt) {
                if (evt.type === EventType.WsBinary &&
                    evt.data[0] === FrameType.GameStateUpdate &&
                    evt.data[1] === GameStateType.EntityMovement) {

                    if (++c === count) {
                        events.off(onEvent);
                        res();
                    }
                }
            };
            events.on(onEvent);
        });
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
        await startServer();
        await gameIsConnected(createGame(createScreen()));
    });

    it("connect multiple games to one server.", async function() {
        await startServer();

        const g1 = createGame(createScreen());
        const g2 = createGame(createScreen());

        await Promise.all([gameIsConnected(g1), gameIsConnected(g2)]);
    });

    it("move the player around.", async function() {
        await startServer();

        const listeners = [];
        const context = createLocalContext();
        const screen = createScreen(listeners);
        const g1 = createGame(screen, context);

        const updates = onServerUpdatePosition(1);
        createInput(screen, context);

        await gameIsReadyToPlay(g1);

        const keyListener = findMovementListener(listeners);

        keyListener[1]("", toBlessedKeyEvent('j'));

        await updates;

        const sStore = server.scs.context.store;
        const gStore = g1.context.store;

        // Knows about players
        const serverEntities = sStore.getAllEntities();

        // This knows about players + local state rendererererers
        // this would be mode.
        const clientEntities = gStore.getAllEntities();

        const clientServerEntities =
            serverEntities.filter(x => ~clientEntities.indexOf(x));

        expect(clientServerEntities).toEqual(serverEntities);

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
        const pos = [
            [30, 50],
            [70, 120],
            [120, 170],
        ] as [number, number][];
        await startServer(pos);

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
            keyListeners.forEach(listener => listener[1]("", toBlessedKeyEvent('j')));
        }

        await updates;

        const sStore = server.scs.context.store;
        expect(sStore.getAllEntities()).toEqual([0, 1337, 1337 * 2]);

        players.forEach((x, i) => {
            const store = x.g.context.store;
            const sPos = getPositionComponent(sStore, i * 1337);
            expect(pos[i][0]).toEqual(sPos.x);
            expect(pos[i][1] + 4).toEqual(sPos.y);
        });
    });

    it("ensure that updates go to players.", async function() {
        await startServer([[3, 3], [GlobalContext.display.width + 4, 3]]);

        const players = Array.from({length: 2}, () => {
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

        await Promise.all(players.map(x => gameIsReadyToPlay(x.g)));
        const listener = findMovementListener(players[1].listeners);
        const update0 = onClientUpdatePosition(players[0].g.context.events, 1);
        const update1 = onClientUpdatePosition(players[1].g.context.events, 1);

        players.forEach(player => {
            player.x = player.g.context.player.position.x;
            player.y = player.g.context.player.position.y;
        });

        const xDelta = players[1].x - players[0].x;
        let xMove = xDelta - GlobalContext.display.width + 1;
        const serverGotMovements = onServerUpdatePosition(xMove);

        do {
            listener[1]("", getMovementFromDir('x', -1));
        } while (--xMove);

        await Promise.all([serverGotMovements, update0, update1]);
        const player00 = getPositionComponent(players[0].g.context.store, 0);
        const player01 = getPositionComponent(players[0].g.context.store, 1337);
        const player10 = getPositionComponent(players[1].g.context.store, 0);
        const player11 = getPositionComponent(players[1].g.context.store, 1337);

        expect(player00.x).toEqual(player10.x);
        expect(player01.x).toEqual(player11.x);

        expect(player00.y).toEqual(player10.y);
        expect(player01.y).toEqual(player11.y);
    });
});

function getPositionComponent(store: EntityStore, entityId: number): PositionComponent {
    // @ts-ignore
    return store.getComponent<PositionComponent>(entityId, PositionComponent);
}
