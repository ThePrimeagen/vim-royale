import Server from '../server';
import { TrackingInfo } from '../types';

export function serverIsListening(server: Server) {
    return new Promise(function(res) {
        server.onListening(res);
    });
}

export async function startServer(port, optionalStartingPositions?: [number, number][]) {
    const server = new Server({
        port,
        width: 200,
        height: 200,
        tick: 1000,
        entityIdRange: 1337,
        optionalStartingPositions
    });

    const game: TrackingInfo[] = [];
    server.onTrackingInfo(info => {
        game.push(info);
    })

    await serverIsListening(server);

    return {server, game};
}

