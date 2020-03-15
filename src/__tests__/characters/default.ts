import DefaultCharacterStrategy from "../../characters/default";

describe('DefaultCharacterStrategy', () => {
    describe('buildChar', () => {
        test('turns a string into a two-dimensional array', () => {
            const strategy = new DefaultCharacterStrategy();
            const input = 'MAIN-MENU';
            const output = [['M', 'A', 'I', 'N', '-', 'M', 'E', 'N', 'U']];

            expect(strategy.buildChar(input)).toEqual(output);
        });
    })
})
