export type GameOptions = {
    width: number;
    height: number;
};

export type MapMessage = string[][];

export enum MovementCommand {
    k = 'k',
    j = 'j',
    l = 'l',
    h = 'h',
}

