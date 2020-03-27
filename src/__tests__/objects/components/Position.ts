import BasicCharacterStrategy from "../../../characters/basic";
import PositionComponent from "../../../objects/components/position";
import StyledCharacterStrategy from "../../../characters/styled";

describe('PositionComponent', () => {
    test('creates basic character strategy by default', () => {
        const position = new PositionComponent('', 0, 0);

        expect(position.characterStrategy)
            .toBeInstanceOf(BasicCharacterStrategy);
    })

    test('accepts a character strategy in the constructor', () => {
        const strategy = new StyledCharacterStrategy('test');
        const position = new PositionComponent(strategy, 0, 0);

        expect(position.characterStrategy).toEqual(strategy);
    });

    test('delegates setting chars to the current character strategy', () => {
        const strategy = new BasicCharacterStrategy('');
        const position = new PositionComponent(strategy, 0, 0);
        const expected = [['t', 'e', 's', 't']];

        position.setChar('test')

        expect(strategy.char).toEqual(expected);
    })
});
