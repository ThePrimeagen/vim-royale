import net from 'node:net';
import { isJson } from './config';
import parse, { ServerMessage } from './messages/messages';

let count = 0;
let start: number = 0;
const server = net.createServer((c) => {
    if (start === 0) {
        start = Date.now() + 10000;
    }
    // 'connection' listener.
    c.on('end', () => {
        console.log('client disconnected');
    });

    let remainder = Buffer.alloc(65536);
    let remainderOffset = 0;

    c.on('data', (buffer: Buffer) => {
        buffer.copy(remainder, remainderOffset);
        const len = remainderOffset + buffer.byteLength;

        let offset = 0;
        do {
            const parsed = parse(buffer, offset, len);
            if (parsed) {
                const [
                    _,
                    nextOffset,
                ] = parsed;
                count++;
                offset = nextOffset;

                if (count % 10000 === 0) {
                    if (start <= Date.now()) {
                        const diff = Date.now() - (start - 10000);
                        console.log("time", diff, "count", count, "parsed per ms", count / diff);
                        process.exit(0);
                    }
                }

            } else {
                remainderOffset = len - offset;
                remainder.copy(remainder, 0, offset, len);
            }
        } while (true);
    });
});

server.on('error', (err) => {
    throw err;
});

server.listen(42000, () => {
    console.log('server bound');
});

