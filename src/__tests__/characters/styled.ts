import StyledCharacterStrategy from "../../characters/styled";

describe('BasicCharacterStrategy', () => {
    describe('buildChar', () => {
        test('turns a string into a two-dimensional array with no styles by default', () => {
            const strategy = new StyledCharacterStrategy();
            const input = 'MAIN-MENU';
            const output = [['M', 'A', 'I', 'N', '-', 'M', 'E', 'N', 'U']];

            expect(strategy.buildChar(input)).toEqual(output);
        });

        test('adds bold tags', () => {
            const strategy = new StyledCharacterStrategy({bold: true});
            const input = 'MAIN-MENU';
            const output = [['{bold}M', 'A', 'I', 'N', '-', 'M', 'E', 'N', 'U{/bold}']];

            expect(strategy.buildChar(input)).toEqual(output);
        });

        test("doesn't add bold tags if bold is set to false", () => {
            const strategy = new StyledCharacterStrategy({bold: false});
            const input = 'MAIN-MENU';
            const output = [['M', 'A', 'I', 'N', '-', 'M', 'E', 'N', 'U']];

            expect(strategy.buildChar(input)).toEqual(output);
        });

        test('adds foreground color tags', () => {
            const strategy = new StyledCharacterStrategy({fg: 'FF0000'});
            const input = 'MAIN-MENU';
            const output = [['{#FF0000-fg}M', 'A', 'I', 'N', '-', 'M', 'E', 'N', 'U{/#FF0000-fg}']];

            expect(strategy.buildChar(input)).toEqual(output);
        });

        test('adds background color tags', () => {
            const strategy = new StyledCharacterStrategy({bg: 'CCDDEE'});
            const input = 'MAIN-MENU';
            const output = [['{#CCDDEE-bg}M', 'A', 'I', 'N', '-', 'M', 'E', 'N', 'U{/#CCDDEE-bg}']];

            expect(strategy.buildChar(input)).toEqual(output);
        });

        test('adds multiple styles at the same time', () => {
            const strategy = new StyledCharacterStrategy({bold: true, bg: 'CCDDEE', fg: 'FF0000'});
            const input = 'MAIN-MENU';
            const output = [['{#FF0000-fg}{#CCDDEE-bg}{bold}M', 'A', 'I', 'N', '-', 'M', 'E', 'N', 'U{/bold}{/#CCDDEE-bg}{/#FF0000-fg}']];

            expect(strategy.buildChar(input)).toEqual(output);
        });
    })
})
