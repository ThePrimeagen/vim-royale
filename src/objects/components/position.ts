import {Component} from '../../entities';
import BasicCharacterStrategy from '../../characters/basic';

export interface CharacterStrategy {
    buildChar(Char: string): string[][];
}

// What we render
export default class PositionComponent implements Component {
    public static type: string = "position";
    absolute: boolean;
    type: string = "position";
    x: number;
    y: number;
    z: number;
    private _char: string[][];
    private _rawChar: string;
    private _characterStrategy: CharacterStrategy;

    get char(): string[][] {
        return this._char;
    }

    get characterStrategy(): CharacterStrategy {
        return this._characterStrategy;
    }

    constructor(char: string, x: number, y: number, z: number = 0, absolute = false) {
        this._characterStrategy = new BasicCharacterStrategy();
        this._rawChar = char; // save raw char so we have it when we switch strategies
        this.setChar(char);
        this.x = x;
        this.y = y;
        this.z = z;
        this.absolute = absolute;
    }

    setCharacterStrategy(strategy: CharacterStrategy) {
        this._characterStrategy = strategy;
        this.setChar(this._rawChar);
    }

    setChar(char: string) {
        this._rawChar = char;
        this._char = this._characterStrategy.buildChar(char);
    }
}
