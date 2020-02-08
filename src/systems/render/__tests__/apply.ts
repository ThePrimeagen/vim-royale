import apply from '../apply';

describe("Apply", function() {
    it("basically do what I want tit to do.", function() {
        const test = [
            "foo".split(""),
            "bar".split(""),
        ];

        const expected = [
            "f0o".split(""),
            "b0r".split(""),
        ];

        const toWrite = [
            ['0'],
            ['0'],
        ];

        const offsetX = 1;

        apply(test, toWrite, offsetX, 0, 0, 0);
        expect(test).toEqual(expected);
    });
});


