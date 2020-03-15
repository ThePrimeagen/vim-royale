import { CharacterStrategy } from "../objects/components/position";

export default class DefaultCharacterStrategy implements CharacterStrategy {
    buildChar(char: string) {
        return [char.split("")];
    }
}
