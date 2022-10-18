import { isJson } from "../config";

export type Position = {row: number, col: number};

function parseEntityId(buffer: Buffer, offset: number): number {
    return buffer.readUint8(offset) << 16 |
        buffer.readUint16BE(offset + 1);
}

function parsePosition(buffer: Buffer, offset: number): Position {
    const rowCol = buffer.readUint32BE(offset);
    return {
        row: (rowCol >> 16) & 0xFF,
        col: rowCol & 0xFF,
    };
}

export enum MessageType {
    WhoAmI = 0,
    PlayerStart = 1,

    PlayerPositionUpdate = 2,
    CreateEntity = 3,
    DeleteEntity = 4,
    HealthUpdate = 5,
    CirclePosition = 6,
    CircleStart = 7,
    PlayerCount = 8,
    PlayerQueueCount = 9,
    PlayerQueueCountResult = 10,
    GameCount = 11,
    GameCountResult = 12,
}

export enum WhoAmIType {
    Server = 0,
    Client = 1,
}

export type Entity = {
    entityId: number
}

export type PlayerStart = {
    type: MessageType.PlayerStart,
    value: Entity & {
        range: number,
        position: Position,
    }
}

export type PlayerPositionUpdate = {
    type: MessageType.PlayerPositionUpdate,
    value: Entity & {
        position: Position,
    }
}

export type CreateEntity = {
    type: MessageType.CreateEntity,
    value: Entity & {
        position: Position,
        info: number,
    }
}

export type DeleteEntity = {
    type: MessageType.DeleteEntity,
    value: Entity,
}

export type HealthUpdate = {
    type: MessageType.HealthUpdate,
    value: Entity & {
        health: number,
    }
}

export type CirclePosition = {
    type: MessageType.CirclePosition,
    value: {
        size: number,
        position: Position,
        seconds: number,
    }
}

export type CircleStart = {
    type: MessageType.CircleStart,
    value: {
        seconds: number,
    }
}

export type PlayerCount = {
    type: MessageType.PlayerCount,
    value: {
        count: number,
    }
}

export type WhoAmI = {
    type: MessageType.WhoAmI,
    value: WhoAmIType;
}

export type PlayerQueueCount = {
    type: MessageType.PlayerQueueCount,
    value: undefined
}

export type GameCount = {
    type: MessageType.GameCount,
    value: undefined
}

export type PlayerQueueCountResult = {
    type: MessageType.PlayerQueueCountResult,
    value: number
}

export type GameCountResult = {
    type: MessageType.GameCountResult,
    value: number
}

export type Message =
    PlayerStart | PlayerPositionUpdate | CreateEntity |
    DeleteEntity | HealthUpdate | CirclePosition |
    CircleStart | PlayerCount | WhoAmI |
    PlayerQueueCount | GameCount | PlayerQueueCountResult |
    GameCountResult;

export type ServerMessage = {
    seqNu: number,
    version: number,
    msg: Message, // Message here is now u8
}

function whoAmI(msg: Buffer, offset: number): WhoAmI {
    return {
        type: MessageType.WhoAmI,
        value: msg.readUint8(offset),
    };
}

function playerStart(msg: Buffer, offset: number): PlayerStart {
    return {
        type: MessageType.PlayerStart,
        value: {
            entityId: parseEntityId(msg, offset),
            range: msg.readUint16BE(offset + 3),
            position: parsePosition(msg, offset + 5),
        },
    };
}

function playerPositionUpdate(msg: Buffer, offset: number): PlayerPositionUpdate {
    return {
        type: MessageType.PlayerPositionUpdate,
        value: {
            entityId: parseEntityId(msg, offset),
            position: parsePosition(msg, offset + 3),
        },
    };
}

function createEntity(msg: Buffer, offset: number): CreateEntity {
    return {
        type: MessageType.CreateEntity,
        value: {
            entityId: parseEntityId(msg, offset),
            position: parsePosition(msg, offset + 3),
            info: msg.readUint8(offset + 7),
        },
    };
}

function deleteEntity(msg: Buffer, offset: number): DeleteEntity {
    return {
        type: MessageType.DeleteEntity,
        value: {
            entityId: parseEntityId(msg, offset),
        },
    };
}

function healthUpdate(msg: Buffer, offset: number): HealthUpdate {
    return {
        type: MessageType.HealthUpdate,
        value: {
            entityId: parseEntityId(msg, offset),
            health: msg.readUint16BE(offset + 3),
        },
    };
}

function circlePosition(msg: Buffer, offset: number): CirclePosition {
    return {
        type: MessageType.CirclePosition,
        value: {
            size: msg.readUint16BE(offset),
            position: parsePosition(msg, offset + 2),
            seconds: msg.readUint8(offset + 6),
        },
    };
}

function circleStart(msg: Buffer, offset: number): CircleStart {
    return {
        type: MessageType.CircleStart,
        value: {
            seconds: msg.readUint8(offset),
        },
    };
}

function playerCount(msg: Buffer, offset: number): PlayerCount {
    return {
        type: MessageType.PlayerCount,
        value: {
            count: msg.readUint8(offset),
        },
    };
}

function playerQueueCount(_msg: Buffer, _offset: number): PlayerQueueCount {
    return {
        type: MessageType.PlayerQueueCount,
        value: undefined,
    };
}

function gameCount(_msg: Buffer, _offset: number): GameCount {
    return {
        type: MessageType.GameCount,
        value: undefined,
    };
}

function playerQueueCountResult(msg: Buffer, offset: number): PlayerQueueCountResult {
    return {
        type: MessageType.PlayerQueueCountResult,
        value: msg.readUint8(offset),
    };
}

function gameCountResult(msg: Buffer, offset: number): GameCountResult {
    return {
        type: MessageType.GameCountResult,
        value: msg.readUint8(offset),
    };
}

type MessageTypeToType = {
    [MessageType.WhoAmI]: WhoAmI,
    [MessageType.PlayerStart]: PlayerStart,
    [MessageType.PlayerPositionUpdate]: PlayerPositionUpdate,
    [MessageType.CreateEntity]: CreateEntity,
    [MessageType.DeleteEntity]: DeleteEntity,
    [MessageType.HealthUpdate]: HealthUpdate,
    [MessageType.CirclePosition]: CirclePosition,
    [MessageType.CircleStart]: CircleStart,
    [MessageType.PlayerCount]: PlayerCount,
    [MessageType.WhoAmI]: WhoAmI,
    [MessageType.PlayerQueueCount]: PlayerQueueCount,
    [MessageType.GameCount]: GameCount,
    [MessageType.PlayerQueueCountResult]: PlayerQueueCountResult,
    [MessageType.GameCountResult]: GameCountResult,
}

type ParseMap = {
    [P in keyof MessageTypeToType]: (msg: Buffer, offset: number) => MessageTypeToType[P];
}

const parseMap: ParseMap = {
    [MessageType.WhoAmI]: whoAmI,
    [MessageType.PlayerStart]: playerStart,
    [MessageType.PlayerPositionUpdate]: playerPositionUpdate,
    [MessageType.CreateEntity]: createEntity,
    [MessageType.DeleteEntity]: deleteEntity,
    [MessageType.HealthUpdate]: healthUpdate,
    [MessageType.CirclePosition]: circlePosition,
    [MessageType.CircleStart]: circleStart,
    [MessageType.PlayerCount]: playerCount,
    [MessageType.WhoAmI]: whoAmI,
    [MessageType.PlayerQueueCount]: playerQueueCount,
    [MessageType.GameCount]: gameCount,
    [MessageType.PlayerQueueCountResult]: playerQueueCountResult,
    [MessageType.GameCountResult]: gameCountResult,
}

// TODO: Lots of garbage being created here
export default function parse(msg: Buffer, offset: number, maxByte: number): [ServerMessage, number] | undefined {
    if (isJson()) {
        const len = msg.readUint8(0);
        if (len <= maxByte - 1) {
            return [
                JSON.parse(msg.subarray(1, 1 + len).toString()),
                len + 1
            ];
        }

        return undefined;
    }

    const len = msg.readUint8(offset);
    if (len > maxByte - offset - 1) {
        return undefined;
    }

    const key: MessageType = msg.readUint8(offset + 4);
    const fn = parseMap[key];

    return [
        {
            seqNu: msg.readUint16BE(offset + 1),
            version: msg.readUint8(offset + 3),
            msg: fn(msg, offset + 4),
        },
        len + 1,
    ]
}


