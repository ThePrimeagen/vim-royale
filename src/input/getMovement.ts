import { Command, CommandType } from "../types";
import Board, { JumpCoordinate, LookDirection } from "../board";
import createLogger from "../logger";
import PositionComponent from "../objects/components/position";

const logger = createLogger("getMovement");

export function getCommand(commands: Command[], type: CommandType): Command | void {
    let command: Command;

    for (let i = 0; !command && i < commands.length; ++i) {
        if (commands[i].type === type) {
            command = commands[i];
        }
    }

    return command;
}

export function getInputCommand(commands: Command[]): Command | void {
    return getCommand(commands, CommandType.Input);
}

export function getMotionCommand(commands: Command[]): Command | void {
    return getCommand(commands, CommandType.Motion);
}

export function getCountCommand(commands: Command[]): Command | void {
    return getCommand(commands, CommandType.Count);
}

export default function getMovement(board: Board, pos: PositionComponent, commands: Command[]) {
    const outArr = [0, 0];
    const command = getMotionCommand(commands);
    const countCommand = getCountCommand(commands);
    const count = countCommand && +countCommand.char || 1;

    if (!command) {
        return outArr;
    }

    logger("motion", command.char, "count", count);

    switch (command.char) {
        case 'T':
        case 't':
        case 'F':
        case 'f': {
            const lookDir = (command.char.charCodeAt(0) & 32) === 0 ?
                    LookDirection.Left : LookDirection.Right;
            const letters = board.getLetters(pos, lookDir);
            const letter = getInputCommand(commands);

            // Nothing to return
            if (!letter) {
                break;
            }

            let nextSpot: JumpCoordinate;
            for (let i = 0; i < letters.length; ++i) {
                if (letter.char === letters[i].letter) {
                    nextSpot = letters[i];
                }
            }

            if (!nextSpot) {
                break;
            }

            outArr[0] = nextSpot.position.x - pos.x;
            break;
        }

        case 'h':
            outArr[0] = -1 * count;
            break;

        case 'l':
            outArr[0] = 1 * count;
            break;

        case 'j':
            outArr[1] = 1 * count;
            break;

        case 'k':
            outArr[1] = -1 * count;
            break;
    }

    logger("getMovement returning", outArr);
    return outArr;
}

