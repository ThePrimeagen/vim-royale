import { LocalContext } from "./context";
import Board from "./board";
import { EventType, EventData, InputEvent } from "./events";
import { Command, CommandType } from "./input/types";

function getInputCommand(results: Command[]): Command {
    return results.filter(r => r.type === CommandType.Input)[0];
}

// TODO: movement validation, and sorta debounce
// 2 (alter the next move for 200 ms)
// j (terminal) terminal
function isMovementCommand(input: Command): boolean {
    switch (input.char) {
        case "j":
        case "k":
        case "l":
        case "h":
            return true;
    }

    return false;
}

function isFCommand(input: Command): boolean {
    switch (input.char) {
        case "f":
        case "F":
        case "t":
        case "T":
            return true;
    }

    return false;
}


export function inputEventListener(context: LocalContext, board: Board) {
    context.events.on(EventType.Input, function(data: EventData) {
        data = data as InputEvent;

    });
}


