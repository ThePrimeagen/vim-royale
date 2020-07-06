import GlobalContext, { LocalContext } from "../context";
import { InputCommand, Command, CommandType } from "../types";
import { JumpCoordinate } from "../board";

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

export default function getMovement(context: LocalContext, commands: Command[]) {
    const outArr = [0, 0];
    const command = getMotionCommand(commands);

    if (!command) {
        return outArr;
    }

    switch (command.char) {
        case 'T':
        case 't':
        case 'F':
        case 'f': {
            if (!context.board) {
                break;
            }

            const player = context.player;
            const letters = context.board.getLetters(player.position);
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

            outArr[0] = nextSpot.position.x - player.position.x;
            break;
        }

        case 'h':
            outArr[0] = -1;
            break;

        case 'l':
            outArr[0] = 1;
            break;

        case 'j':
            outArr[1] = 1;
            break;

        case 'k':
            outArr[1] = -1;
            break;
    }

    for (let i = 0; i < outArr.length; ++i) {
        outArr[i] *= ch.count;
    }

    return outArr;
}

