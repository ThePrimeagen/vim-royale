import StyledCharacterStrategy from "../../characters/styled";

describe('StyledCharacterStrategy', () => {
    describe('new', () => {
        test('processes the provided chars', () => {
            const input = 'MAIN-MENU';
            const strategy = new StyledCharacterStrategy(input, {bold: true});
            const expected = [['{bold}M', 'A', 'I', 'N', '-', 'M', 'E', 'N', 'U{/bold}']];

            expect(strategy.char).toEqual(expected);
        });
    })

    describe('setChar', () => {
        test('turns a string into a two-dimensional array with no styles by default', () => {
            const strategy = new StyledCharacterStrategy('');
            const input = 'MAIN-MENU';
            const expected = [['M', 'A', 'I', 'N', '-', 'M', 'E', 'N', 'U']];

            strategy.setChar(input);

            expect(strategy.char).toEqual(expected);
        });

        test('adds bold tags', () => {
            const strategy = new StyledCharacterStrategy('', {bold: true});
            const input = 'MAIN-MENU';
            const expected = [['{bold}M', 'A', 'I', 'N', '-', 'M', 'E', 'N', 'U{/bold}']];

            strategy.setChar(input);

            expect(strategy.char).toEqual(expected);
        });

        test("doesn't add bold tags if bold is set to false", () => {
            const strategy = new StyledCharacterStrategy('', {bold: false});
            const input = 'MAIN-MENU';
            const expected = [['M', 'A', 'I', 'N', '-', 'M', 'E', 'N', 'U']];

            strategy.setChar(input);

            expect(strategy.char).toEqual(expected);
        });

        test('adds foreground color tags', () => {
            const strategy = new StyledCharacterStrategy('', {fg: 'FF0000'});
            const input = 'MAIN-MENU';
            const expected = [['{#FF0000-fg}M', 'A', 'I', 'N', '-', 'M', 'E', 'N', 'U{/#FF0000-fg}']];

            strategy.setChar(input);

            expect(strategy.char).toEqual(expected);
        });

        test('adds background color tags', () => {
            const strategy = new StyledCharacterStrategy('', {bg: 'CCDDEE'});
            const input = 'MAIN-MENU';
            const expected = [['{#CCDDEE-bg}M', 'A', 'I', 'N', '-', 'M', 'E', 'N', 'U{/#CCDDEE-bg}']];

            strategy.setChar(input);

            expect(strategy.char).toEqual(expected);
        });

        test('adds multiple styles at the same time', () => {
            const strategy = new StyledCharacterStrategy('', {bold: true, bg: 'CCDDEE', fg: 'FF0000'});
            const input = 'MAIN-MENU';
            const expected = [['{#FF0000-fg}{#CCDDEE-bg}{bold}M', 'A', 'I', 'N', '-', 'M', 'E', 'N', 'U{/bold}{/#CCDDEE-bg}{/#FF0000-fg}']];

            strategy.setChar(input);

            expect(strategy.char).toEqual(expected);
        });
    })
});
