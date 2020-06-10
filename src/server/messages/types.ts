import {InputCommand} from '../../types';

export enum FrameType {
    CreateEntity = 1,
    UpdatePosition = 2,
    CorrectPosition = 3,
    GameStateUpdate = 4,
};

export enum CreateType {
    Player = 0x0,
};

export type CreateEntityResult = {
    x: number;
    y: number;
    entityId: number;
};

export enum GameStateType {
    EntityMovement = 1,
    PlaceBullet = 2,
    RemoveEntityRange = 3,
}

export type GameStateEntityMovement = {
    type: GameStateType.EntityMovement;
    x: number;
    y: number;
    entityId: number;
    char: string;
}

export type GameStateRemoveEntityRange = {
    type: GameStateType.RemoveEntityRange;
    from: number;
    to: number;
}

// TODO: I hate this.
export type GameStateUpdateResults = GameStateEntityMovement | GameStateRemoveEntityRange;

export type CorrectPositionResult = {
    x: number;
    y: number;
    entityId: number;
    nextId: number;
};

export type UpdatePositionResult = {
    x: number;
    y: number;
    entityId: number;
    movementId: number;
    key: InputCommand;
};
