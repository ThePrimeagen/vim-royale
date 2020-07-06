import fs from "fs";

import {Renderer} from "./renderer";
import {captureFromFile, ParsedLine} from "./reader";

try {
    console.log("Process.argv", process.argv);

    if (!process.argv[2]) {
        console.error("You didn't provide a file");
        process.exit(1);
    }

    if (!fs.statSync(process.argv[2])) {
        console.error("statSync returned null");
        process.exit(1);
    }

} catch (e) {
    console.error("Error:", e);
    process.exit(1);
}

const fileName = process.argv[2];
const renderer = new Renderer();

const displayMap: {[key: string]: string} = {};
captureFromFile(fileName, (line: ParsedLine) => {
    if (!displayMap[line.prefix]) {
        // TODO: Should be an array.
    }

    // TODO: Incorporate timestamps
    displayMap[line.prefix] = line.line;

    renderer.render(Object.
       keys(displayMap).
       map(k => `${k}: ${displayMap[k]}`).
       join("\n"));
});


