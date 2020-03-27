import BasicCharacterStrategy from "../../characters/basic";

describe('BasicCharacterStrategy', () => {
    describe('new', () => {
        test('sets initial string into a two-dimensional array', () => {
            const input = 'NORMAL';
            const strategy = new BasicCharacterStrategy(input);
            const expected = [['N', 'O', 'R', 'M', 'A', 'L']];

            expect(strategy.char).toEqual(expected);
        });
    });

    describe('setChar', () => {

        test('turns a string into a two-dimensional array', () => {
            const input = 'MAIN-MENU';
            const strategy = new BasicCharacterStrategy('');
            const expected = [['M', 'A', 'I', 'N', '-', 'M', 'E', 'N', 'U']];

            strategy.setChar(input)

            expect(strategy.char).toEqual(expected);
        });
    })
})
