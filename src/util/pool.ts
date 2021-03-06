import BufferWriter from './buffer-writer';
import BufferReader from './buffer-reader';

// TODO(Garbage): Create a after round cleanup pool.  This pool will reclaim
// all objects created on the next tick after the WS messages have been
// processed, but the next server tick still has some time.
export type Object = {[key: string]: any};
class ObjectSyncPool {
    private pool: Object[];
    constructor() {
        this.pool = [];
    }

    malloc(): Object {
        if (this.pool.length === 0) {
            this.pool.push({});
        }
        return this.pool.pop();
    }

    free(obj: Object) {
        this.pool.push(obj);
    }
}

class ArraySyncPool {
    private pool: Array<any>[];
    constructor() {
        this.pool = [];
    }

    malloc(): Array<any> {
        if (this.pool.length === 0) {
            this.pool.push([]);
        }
        return this.pool.pop();
    }

    free(obj: Array<any>) {
        obj.length = 0;
        this.pool.push(obj);
    }
}

export const ObjectPool = new ObjectSyncPool();
export const ArrayPool = new ArraySyncPool();

export type AsyncPoolItem<T> = { free: () => void, item: T };
export type AsyncPoolFreeFunction<T> = (item: AsyncPoolItem<T>) => void;
export type AsyncPoolFactory<T> = (freeFn: AsyncPoolFreeFunction<T>) => AsyncPoolItem<T>;

export class AsyncPool<T> {
    private factory: AsyncPoolFactory<T>;
    private pool: AsyncPoolItem<T>[];
    private boundFree: AsyncPoolFreeFunction<T>;

    constructor(factory: AsyncPoolFactory<T>) {
        this.factory = factory;
        this.pool = [];
        this.boundFree = this.free.bind(this);
    }

    get(): AsyncPoolItem<T> {
        if (this.pool.length === 0) {
            this.pool.push(this.factory(this.boundFree));
        }

        const retVal = this.pool.pop() as AsyncPoolItem<T>;
        return retVal;
    }

    private free(item: AsyncPoolItem<T>) {
        this.pool.push(item);
    }
};

export function createBufferWriterPool(length: number): AsyncPool<BufferWriter> {
    function bufferWriterFactory(free) {
        const retVal = {
            free: () => {
                retVal.item.reset();
                free(retVal)
            },
            item: new BufferWriter(length)
        };
        return retVal;
    }


    return new AsyncPool<BufferWriter>(bufferWriterFactory);
}

function bufferReaderFactory(free) {
    return {
        free,
        item: new BufferReader()
    };
}

const BufferReaderPool = new AsyncPool<BufferReader>(bufferReaderFactory);

export {
    BufferReaderPool,
}

