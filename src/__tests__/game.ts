import test from './mock.bless';
process.env.SUPPRESS_LOGS = 'false';
process.env.TIMESTAMP_LOGS = 'true';
process.env.TICK = '1000';

test();

import GameController from '../game-controller';
import Server from '../server';
import { wait } from './utils';
import Player from '../objects/player';
import Bullet from '../objects/bullet';
import PositionComponent from '../objects/components/position';
import LifetimeComponent from '../objects/components/lifetime';
import Game from '../';
import { TrackingInfo } from '../types';

import {
    gameHasStarted,
    gameIsConnected,
    createGame,
    initializeGame,
    createScreen,
    getNextWSMessage,
} from './game.utils';

import {
    serverIsListening,
    startServer,
} from './server.utils';

describe("Game", function() {
    let port = 13370;
    let testServer: Server;
    let serverGames: TrackingInfo[];

    async function initialize(optionalStartingPositions?: [number, number][]) {
        const {
            server,
            game
        } = await startServer(port, optionalStartingPositions);

        testServer = server;
        serverGames = game;
    };

    afterEach(function() {
        jest.clearAllTimers();
        port++
    });

    xit("should connect to the server, and syncs a bullet to the server.", async function() {
        await initialize([[5, 5]]);
        const [
            game,
            con
        ] = await initializeGame(port, 1000);

        con.shootBullet("j");
        await getNextWSMessage(serverGames[0]);

        const bulletMessage = await getNextWSMessage(serverGames[0]);
        const bulletId = Bullet.decode(testServer.scs.context, bulletMessage, 1);

        const sPos = testServer.scs.context.store.getComponent<PositionComponent>(bulletId, PositionComponent);
        const cPos = game.context.store.getComponent<PositionComponent>(bulletId, PositionComponent);

        expect(sPos.x).toEqual(cPos.x);
        expect(cPos.y).toBeGreaterThanOrEqual(sPos.y);

        game.shutdown();
        testServer.shutdown();
    });

    it("should connect to the server, and syncs a bullet to the server and another client.", async function() {
        await initialize([[5, 5], [10, 5]]);
        const [
            g1,
            g2,
        ] = await Promise.all([
            initializeGame(port, 1000),
            initializeGame(port, 1000),
        ]);

        const [
            game1,
            con1,
        ] = g1;

        const [
            game2,
            con2,
        ] = g2;

        expect(serverGames.length).toEqual(2);
        console.log(Date.now(), "HERE");

        // These are the player creation messages
        const [
            p1Creation,
            p2Creation,
        ] = await Promise.all([
            getNextWSMessage(serverGames[0]),
            getNextWSMessage(serverGames[1]),
        ]);

        con1.shootBullet("l");

        console.log(Date.now(), "HERE");

        const [
            serverBulletMessage,
            player2BulletMessage,
        ] = await Promise.all([
            getNextWSMessage(serverGames[0]),
            getNextWSMessage(game2),
        ]);

        console.log(Date.now(), "HERE");

        debugger;

        game1.shutdown();
        game2.shutdown();
        testServer.shutdown();
    });
});
