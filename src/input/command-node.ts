import { LETTER_LIST } from "../board/jumps";

export enum CommandType {
    Count = 0,
    Motion,
    Input,
};

export type Command = {
    type: CommandType;
    char: string;
}

export abstract class CommandNode {
    protected ch?: string;
    constructor(private isTerminal: boolean,
                private typeOfCommand: CommandType,
                private matchString: string) { }

    atTerminal(): boolean {
        return this.isTerminal;
    }

    getCommand(): Command | null {
        if (!this.ch) {
            return null;
        }

        return {
            type: this.typeOfCommand,
            char: this.ch,
        };
    }

    processKey(ch: string): null | CommandNode {
        this.ch = null;

        if (~this.matchString.indexOf(ch)) {
            this.ch = ch;
            return this.getNextCommandNode();
        }

        return null;
    }

    getNextCommandNode(): CommandNode | null {
        return null;
    }
}

export class JumpNode extends CommandNode {
    constructor() {
        super(true, CommandType.Input, LETTER_LIST);
    }
}

export class FNode extends CommandNode {
    private jumper: JumpNode;

    constructor() {
        super(false, CommandType.Motion, "fFtT");
        this.jumper = new JumpNode();
    }

    getNextCommandNode() { return this.jumper; }
}

export class HjklNode extends CommandNode {
    constructor() {
        super(true, CommandType.Input, "hjkl");
    }
}

export class CountNode extends CommandNode {

    private hjkl: HjklNode;
    constructor() {
        super(false, CommandType.Count, "0123456789");
        this.hjkl = new HjklNode();
    }

    getNextCommandNode() { return this.hjkl; }
}


