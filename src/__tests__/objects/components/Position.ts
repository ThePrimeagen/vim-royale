import DefaultCharacterStrategy from "../../../characters/default";
import PositionComponent from "../../../objects/components/position";

describe('PositionComponent', () => {
    describe('setChar', () => {
        test('uses default character strategy by default', () => {
            const position = new PositionComponent('', 0, 0);

            expect(position.characterStrategy)
              .toBeInstanceOf(DefaultCharacterStrategy);
        })
    });
});
