import readline from "readline";
import {exec} from "child_process";

export type ParsedLine = {
    prefix: string;
    ts: number;
    line: string;
}

export function captureFromFile(path: string, cb: (line: ParsedLine) => void) {
    const tail = exec(`tail -f ${path}`);

    const rl = readline.createInterface({
        input: tail.stdout,
    });

    rl.on("line", str => {
        const line: ParsedLine = {
            ts: 0,
            line: "",
            prefix: ""
        };

        let parts = str.split(" ");
        if (!isNaN(+parts[0])) {
            line.ts = +parts[0];
            parts = parts.slice(1);
        }

        line.prefix = parts[0];
        line.line = parts.slice(1).join(" ");

        cb(line);
    });
}

