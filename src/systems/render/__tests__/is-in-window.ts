import isInWindow from '../is-in-window';

describe("isInWindow", function() {

    it("validate that x is in window", function() {
        const width = 20;
        const height = 20;
        const leftX = 50;
        const leftY = 50;

        // rightSide
        const rInX = leftX + width - 1;
        const rInY = leftY + width - 1;
        const rOutX = leftX + width;
        const rOutY = leftY + width;

        const lInX = leftX;
        const lInY = leftY;
        const lOutX = leftX - 1;
        const lOutY = leftY - 1;

        expect(isInWindow(leftX, leftY, width, height, lInX, lInY)).toEqual(true);
        expect(isInWindow(leftX, leftY, width, height, lOutX, lOutY)).toEqual(false);
        expect(isInWindow(leftX, leftY, width, height, rInX, rInY)).toEqual(true);
        expect(isInWindow(leftX, leftY, width, height, rOutX, rOutY)).toEqual(false);
    });
});


