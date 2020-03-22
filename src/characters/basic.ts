import { CharacterStrategy } from "../objects/components/position";

export default class BasicCharacterStrategy implements CharacterStrategy {
    private _char: string[][];

    get char() {
        return this._char;
    }

    constructor(chars: string) {
        this.setChar(chars);
    }

    setChar(char: string) {
        this._char = [char.split("")];
    }
}
