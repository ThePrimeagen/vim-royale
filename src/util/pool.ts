import BufferWriter from './buffer-writer';
import BufferReader from './buffer-reader';

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

        return this.pool.pop() as AsyncPoolItem<T>;
    }

    private free(item: AsyncPoolItem<T>) {
        this.pool.push(item);
    }
};

function bufferWriterFactory(free) {
    return {
        free,
        item: new BufferWriter(0)
    }
}

const BufferWriterPool = new AsyncPool<BufferWriter>(bufferWriterFactory);

function bufferReaderFactory(free) {
    return {
        free,
        item: new BufferReader()
    };
}

const BufferReaderPool = new AsyncPool<BufferReader>(bufferReaderFactory);

export {
    BufferWriterPool,
    BufferReaderPool,
}

