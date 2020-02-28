export type Object = {[key: string]: any};

export default class ObjectPool {
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

