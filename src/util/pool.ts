// Source: Milo open source project for netflix.  I wrote it there, so why
// cannot I use it here? well, actualyl I can, based on the licences
export type PoolItem<T> = {free: () => void, item: T};
export type PoolFreeFunction<T> = (item: PoolItem<T>) => void;
export type PoolFactory<T> = (freeFn: PoolFreeFunction<T>) => PoolItem<T>;

export class Pool<T> {
    private factory: PoolFactory<T>;
    private pool: PoolItem<T>[];
    private boundFree: PoolFreeFunction<T>;

    constructor(factory: PoolFactory<T>) {
        this.factory = factory;
        this.pool = [];
        this.boundFree = this.free.bind(this);
    }

    get(): PoolItem<T> {
        if (this.pool.length === 0) {
            this.pool.push(this.factory(this.boundFree));
        }

        // @ts-ignore
        return this.pool.pop();
    }

    private free(item: PoolItem<T>) {
        this.pool.push(item);
    }
};

export function createBufferPool(size: number) {
    function factory(freeFn: PoolFreeFunction<Buffer>): PoolItem<Buffer> {
        const buf = Buffer.alloc(size);
        const poolItem = {
            item: buf,
            free: () => {
                freeFn(poolItem);
            }
        };

        return poolItem;
    }
    return new Pool<Buffer>(factory);
}

