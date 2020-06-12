import dotenv from "dotenv";
dotenv.config();

import GlobalContext from "../../context";

process.env.JUMP_COUNT_DIVISOR = "1";
process.env.WIDTH = "" + (GlobalContext.display.width * 2);
process.env.HEIGHT = "" + (GlobalContext.display.height * 2);

import { generateJumps } from "../jumps";

describe("Board#generateJumps", function() {

    it("should generate a board", function() {
        const board = generateJumps(
            GlobalContext.display.width * 2, GlobalContext.display.height * 2);

        expect(board.map(l => l.join('')).join('').length).toEqual(4);
    });
});

