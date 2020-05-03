import {Component} from '../../entities';
import BasicCharacterStrategy from '../../characters/basic';

export interface CharacterStrategy {
    char: string[][];
    setChar(Char: string): void;
}

// What we render
export default class PositionComponent implements Component {
    public static type: string = "position";
    absolute: boolean;
    type: string = "position";
    x: number;
    y: number;
    z: number;
    private _characterStrategy: CharacterStrategy;

    get char() {
        return this._characterStrategy.char;
    }

    get characterStrategy(): CharacterStrategy {
        return this._characterStrategy;
    }

    constructor(defaultCharacterStrategyOrText: CharacterStrategy | string,
      x: number, y: number, z: number = 0, absolute = false) {
        if (typeof defaultCharacterStrategyOrText === 'string') {
            this._characterStrategy = new BasicCharacterStrategy(
              defaultCharacterStrategyOrText)
        } else {
            this._characterStrategy = defaultCharacterStrategyOrText;
        }

        this.x = x;
        this.y = y;
        this.z = z;
        this.absolute = absolute;
    }

    setCharacterStrategy(strategy: CharacterStrategy) {
        this._characterStrategy = strategy;
    }

    setChar(char: string) {
        this._characterStrategy.setChar(char);
    }
}

export const blankPosition = new PositionComponent('b', 0, 0);
