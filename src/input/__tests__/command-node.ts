import dotenv from "dotenv";
dotenv.config();

import { CommandProcessor, CommandType, Command, FNode, HjklNode, CountNode, CommandNode } from "../command-node";

const MODIFIER_TTL = +process.env.MODIFIER_TTL;

jest.useFakeTimers();
describe("CommandNode", function() {
    it("should match f for F node.", function() {
        const fNode = new FNode();

        expect(fNode.isTerminal()).toEqual(false);

        expect(fNode.processKey("k")).toEqual(false);
        expect(fNode.getCommand()).toEqual(null);

        expect(fNode.processKey("f")).toEqual(true);
        expect(fNode.getCommand().type).toEqual(CommandType.Motion);
        expect(fNode.getCommand().char).toEqual("f");
    });
});

describe("CommandProcessor", function() {
    beforeEach(() => {
        jest.clearAllTimers();
    });

    it("testing h", function() {
        const processor = new CommandProcessor();

        expect(processor.processKey("h")).toEqual([{
            type: CommandType.Input,
            char: "h",
        }]);
    });

    it("testing f<key>", function() {
        const processor = new CommandProcessor();

        expect(processor.processKey("f")).toEqual(null);
        expect(processor.processKey("Z")).toEqual([{
            type: CommandType.Motion,
            char: "f",
        }, {
            type: CommandType.Input,
            char: "Z",
        }]);
    });

    it("testing <count>j", function() {
        const processor = new CommandProcessor();

        expect(processor.processKey("5")).toEqual(null);
        expect(processor.processKey("j")).toEqual([{
            type: CommandType.Count,
            char: "5",
        }, {
            type: CommandType.Input,
            char: "j",
        }]);
    });

    it("testing timeout", function() {
        const processor = new CommandProcessor();

        expect(processor.processKey("f")).toEqual(null);
        jest.advanceTimersByTime(MODIFIER_TTL - 100);

        expect(processor.processKey("Z")).toEqual([{
            type: CommandType.Motion,
            char: "f",
        }, {
            type: CommandType.Input,
            char: "Z",
        }]);

        expect(processor.processKey("f")).toEqual(null);
        jest.advanceTimersByTime(MODIFIER_TTL);

        expect(processor.processKey("Z")).toEqual(null);
    });
});

