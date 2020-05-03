import { FrameType, CorrectPositionResult } from './types';
import { EntityItem } from '../../entities';
import BufferReader from '../../util/buffer-reader';
import BufferWriter from '../../util/buffer-writer';

// TODO: What about the rubber band problem?  Have you played apex?  I have
// been stuck in one position for what appears to be a snake person.
export default function correctPosition({
    entityId,
    nextId,
    x,
    y,
}: {
    entityId: EntityItem,
    x: number,
    y: number,
    nextId: number,
}): Buffer {

    const b = new BufferWriter(12);

    b.write8(FrameType.CorrectPosition);
    b.write24(entityId);
    b.write24(nextId);
    b.write16(x);
    b.write16(y);

    return b.buffer;
};

// We will get there
export function readCorrectPosition(buf: Buffer, offset: number = 0): CorrectPositionResult {

    const entityId = BufferReader.read24(buf, offset);
    const nextId = BufferReader.read24(buf, offset + 3);
    const x = BufferReader.read16(buf, offset + 6);
    const y = BufferReader.read16(buf, offset + 8);

    return { x, y, entityId, nextId };
};

export function isCorrectPosition(buf: Buffer, offset: number = 0): boolean {
    return buf[offset] === FrameType.CorrectPosition;
}


