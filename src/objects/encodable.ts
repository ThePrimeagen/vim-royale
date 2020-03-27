import BufferWriter from '../server/messages/buffer-writer';
import BufferReader from '../server/messages/buffer-reader';
import {LocalContext} from '../context';
import {EntityItem} from '../entities';

export interface Encodable {
    encode(buffer: Buffer, offset: number);
    getEntityId(): number;
}

export const writeBuffer = new BufferWriter(0);
export const readBuffer = new BufferReader();

export type Decodable = {
    decode(context: LocalContext, buffer: Buffer, offset: number): EntityItem;
    encodeLength: number;
    is(buffer: Buffer, offset: number): boolean;
}

