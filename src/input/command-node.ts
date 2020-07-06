import { Command, CommandType } from "./types";
import { LETTER_LIST } from "../board/jumps";

const MODIFIER_TTL = +process.env.MODIFIER_TTL;

// <number>hjkl, ftFT<onscreen>
// v :
//   fFtT<letter>
//   <number>hjkl
//
//

export abstract class CommandNode {
    protected ch?: string;
    constructor(private terminal: boolean,
                private typeOfCommand: CommandType,
                private matchString: string) { }

    isTerminal(): boolean {
        return this.terminal;
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

    processKey(ch: string): boolean {
        this.ch = null;

        if (~this.matchString.indexOf(ch)) {
            this.ch = ch;
            return true;
        }

        return false;
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
        super(true, CommandType.Motion, "hjkl");
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

export class CommandProcessor {
    private timerId: ReturnType<typeof setTimeout>;
    private commands: CommandNode[];
    private curr?: CommandNode;
    private listOfExecuted!: Command[];

    constructor() {
        this.commands = [
            new HjklNode(),
            new CountNode(),
            new FNode(),
        ];
        this.reset();
    }

    // don't be wasteful
    private getNextCommandNodeList(): CommandNode[] {
        return this.curr && [this.curr] || this.commands;
    }

    // Resets all the stuffs
    private timerReset() {
        clearTimeout(this.timerId);
        this.timerId = null;
    }

    public reset() {
        this.listOfExecuted = [];
        this.curr = null;
        this.timerReset();
    }

    // Everytime we reach a terminal point, I am going to return the list of
    processKey(key: string): null | Command[] {
        const nextNodes = this.getNextCommandNodeList();

        let success = false;

        for (let i = 0; !success && i < nextNodes.length; ++i) {
            const next = nextNodes[i];
            const result = next.processKey(key);

            if (result) {
                this.listOfExecuted.push(next.getCommand());
                this.curr = next;
                success = true;
            }
        }

        if (!success) {
            this.reset();
            return null;
        }

        if (this.curr.isTerminal()) {
            const result = this.listOfExecuted;
            this.reset();

            return result;
        }

        this.timerReset();
        this.timerId = setTimeout(() => {
            this.reset();
        }, MODIFIER_TTL);
        this.curr = this.curr.getNextCommandNode();

        return null;
    }
}

