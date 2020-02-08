import getRenderBounds from '../get-render-bounds';

describe("getRenderBounds", function() {
    let board;

    beforeEach(function() {
        board = new Array(100).fill(0).map(() => new Array(100).fill('0').join(''));
    });

    it("should happy case", function() {
        const width = 20;
        const height = 20;
        const heightOdd = 15;

        let out = getRenderBounds(board, width, height, 50, 50);
        expect(out).toEqual([41, 41]);

        out = getRenderBounds(board, width, heightOdd, 50, 50);
        expect(out).toEqual([41, 43]);
    });
    it("should edges", function() {
        const width = 20;
        const height = 20;

        let out;
        out = getRenderBounds(board, width, height, 5, 50);
        expect(out).toEqual([0, 41]);

        out = getRenderBounds(board, width, height, 50, 5);
        expect(out).toEqual([41, 0]);

        out = getRenderBounds(board, width, height, 5, 5);
        expect(out).toEqual([0, 0]);

        out = getRenderBounds(board, width, height, 95, 50);
        expect(out).toEqual([80, 41]);

        out = getRenderBounds(board, width, height, 50, 95);
        expect(out).toEqual([41, 80]);

        out = getRenderBounds(board, width, height, 95, 95);
        expect(out).toEqual([80, 80]);
    });
});

