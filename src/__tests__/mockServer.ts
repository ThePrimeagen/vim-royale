/*
import WebSocket from 'ws';

export type AnonF = (... args: any[]) => void;
export type Callback = {
    listening: AnonF[]
};

export type Connection = {
    ws: WebSocket,
    entityIdRange: [number, number],
}

let id
export default function createMockServer(
    callbacks: Callback,
    connections: Connection[],
    port = 1337) {

    const wss = new WebSocket.Server({
        port
    });

    wss.on('listening', () => {
        callbacks.listening.forEach(cb => cb());
    });

    let entitiesStart = 0;
    let entitiesRange = 100;

    wss.on('connection', ws => {

        // TODO: on the edities
        const entityIdRange: [number, number] =
            [entitiesStart, entitiesStart + entitiesRange];

        entitiesStart += entitiesRange;

        const trackingInfo: TrackingInfo = {
            ws,
            entityIdRange,
            movementId: 0,
        };

        this.currentPlayers.push(trackingInfo);

        // TODO: Wrap this socket in something to control for types
        // we want to send down the current state to the user.
        // TODO: Fix this shotty startup sequence
        logger("Sending", trackingInfo.id, JSON.stringify({ status: 'ready', encoding: 'json' }));
        ws.send(JSON.stringify({ status: 'ready', encoding: 'json' }));

        const pos = this.pickPosition();
        logger("Sending", trackingInfo.id, {
            type: 'map',
            map: "big map goes here",
            position: pos,
            entityIdRange,
        });

        ws.send(JSON.stringify({
            type: 'map',
            map: this.map,
            position: pos,
            entityIdRange,
        }));

        ws.on('close', () => {
            const idx = this.currentPlayers.indexOf(trackingInfo);
            this.currentPlayers.splice(idx, 1);

            this.context.events.emit({
                type: EventType.WsClose,
                data: trackingInfo
            });
        });

        // Wait for request to join game...
        // TODO: This is where the board needs to be played.
        ws.on('message', msg => {
            if (msg instanceof Uint8Array) {
                binaryMessage.data = msg;
                this.context.events.emit(binaryMessage, trackingInfo);
            }
            // did you know that ws some how emits a Buffer???
            // @ts-ignore
            if (msg.type === "Buffer") {

                // @ts-ignore
                binaryMessage.data = msg.data;
                this.context.events.emit(binaryMessage, trackingInfo);
            }
        });
    });


}
*/
