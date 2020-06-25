import path from 'path';
import fs from 'fs';
import scythe from 'death';
import { setTimeout } from 'timers';

import consoleLogger from './console.log';

export type Logger = (sync: boolean, str: string, cb?: () => void) => void;

const timeoutTime = +process.env.logTimeout || 500;

const queue: string[] = [];
let timeoutId: ReturnType<typeof setTimeout> | null = null;
let isWriting = false;
let log = consoleLogger;

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
    queue.length = 0;

    isWriting = true;
    log(sync, data, function() {
        isWriting = false;
        timeoutId = null;
    });
}

scythe(() => {
    if (timeoutId !== null) {
        clearTimeout(timeoutId);
        timeoutId = null;
        logData(true);
    }
});

export function setLogger(_log: Logger) {
    log = _log;
}

export function flush() {
    if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
    }
    logData(true);
}

export default function createLogger(prefix: string) {
    return function log(...args: any[]) {
        if (process.env.SUPPRESS_LOGS === 'true') {
            return;
        }

        if (timeoutId === null) {
            timeoutId = setTimeout(() => {
                logData();
            }, timeoutTime);
        }

        let timestamp = "";
        if (process.env.TIMESTAMP_LOGS === 'true') {
            timestamp = Date.now() + " ";
        }

        queue.push(`${timestamp}${prefix} ${args.map(toString).join(' ')}`);
    }
}
