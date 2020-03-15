import { CharacterStrategy } from "../objects/components/position";

export default class BasicCharacterStrategy implements CharacterStrategy {
    buildChar(char: string) {
        return [char.split("")];
    }
}
