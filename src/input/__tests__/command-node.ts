import { CommandType, Command, FNode, HjklNode, CountNode, CommandNode } from "../command-node";

describe("CommandNode", function() {
    it("should match f for F node.", function() {
        const fNode = new FNode();

        expect(fNode.atTerminal()).toEqual(false);

        fNode.processKey("k");
        expect(fNode.getCommand()).toEqual(null);

        fNode.processKey("f");
        expect(fNode.getCommand().type).toEqual(CommandType.Motion);
        expect(fNode.getCommand().char).toEqual("f");
    });
});

