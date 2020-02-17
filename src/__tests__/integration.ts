jest.doMock('blessed', () => {
    return {
        box: () => {
            return {
                setContent: jest.fn()
            };
        }
    };
});

import {LocalContext} from '../context';
import Game from '../index';
import Server from '../server';
import util from 'util';

function serverIsListening(server: Server) {
    return new Promise(function(res) {
        server.onListening(res);
    });
}

function gameIsConnected(game: Game) {
    return new Promise(function(res) {
        // TODO: I HATE THE NAME OF THIS FUNCTION.
        game.onConnected(res);
    });
}

describe("integration", function() {
    let server: Server, game: Game[], screen;
    let port: number = 1336;
    let context: LocalContext;

    beforeEach(async function() {
        port++;

        context = {} as LocalContext;

        server = new Server({
            port,
            width: 200,
            height: 200,
            tick: 1000,
            entityIdRange: 2000,
        });

        screen = {
            append: jest.fn(),
            render: jest.fn(),
        };

        //await util.promisify(server.onListening.bind(server))();
        await serverIsListening(server);

        game = [];
    });

    afterEach(function() {
        console.log("aftereach");
        game.forEach(game => {
            game.shutdown();
        });

        console.log("server shutdown");
        server.shutdown();

        game = null;
        server = null;
    });

    function createGame(): Game {
        const g = new Game(screen, { port, host: 'localhost', context});
        game.push(g);
        return g;
    }

    it("should start a game and a server", async function() {
        await gameIsConnected(createGame());
    });

    it("connect multiple games to one server.", async function() {
        const g1 = createGame();
        //const g2 = createGame();

        await gameIsConnected(g1);
        //await gameIsConnected(g2);
        console.log("end async test");
    });
});

