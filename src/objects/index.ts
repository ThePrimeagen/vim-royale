import Bullet from './bullet';
import Player from './player';
import {Decodable} from './encodable';

export {
    Bullet,
    Player,
};

export const decodables = [
    Bullet,
    Player,
] as Decodable[];

export function isUpdateEveryoneEntity(buffer: Buffer, offset: number) {
    return Bullet.is(buffer, offset);
}

export function getEntityIdFromBuffer(buffer: Buffer, offset: number) {
}

