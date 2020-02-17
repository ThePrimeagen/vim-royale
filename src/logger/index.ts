import path from 'path';
import fs from 'fs';
import scythe from 'death';
import { setTimeout } from 'timers';

import consoleLogger from './console-logger';

export type Logger = (sync: boolean, str: string, cb?: () => void) => void;

const timeoutTime = +process.env.logTimeout || 500;

const queue: string[] = [];
let timeoutId: ReturnType<typeof setTimeout> | null = null;
let isWriting = false;

function toString(x: any) {
    if (typeof x === 'string') {
        return x;
    }

    return JSON.stringify(x);
}

function logData(sync: boolean = false) {

    if (!queue.length) {
        return;
    }

    if (isWriting) {
        timeoutId = setTimeout(logData.bind(null, sync), 1000);
    }

    const data = queue.join('\n');

    isWriting = true;
    log(sync, data, function() {
        isWriting = false;
    });
}

let log = consoleLogger;
scythe(() => {
    if (timeoutId !== null) {
        clearTimeout(timeoutId);
        logData(true);
    }
});

export function setLogger(_log: Logger) {
    log = _log;
}

export default function createLogger(prefix: string) {
    return function log(...args: any[]) {
        if (timeoutId === null) {
            timeoutId = setTimeout(() => {
                logData();
            }, timeoutTime);
        }

        queue.push(`${prefix} ${args.map(toString).join(' ')}`);
    }

}
