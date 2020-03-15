import BasicCharacterStrategy from "../../../characters/basic";
import PositionComponent from "../../../objects/components/position";

describe('PositionComponent', () => {
    test('uses basic character strategy by default', () => {
        const position = new PositionComponent('', 0, 0);

        expect(position.characterStrategy)
            .toBeInstanceOf(BasicCharacterStrategy);
    })
});
