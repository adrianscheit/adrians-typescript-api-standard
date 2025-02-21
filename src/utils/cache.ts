export abstract class Cache<T, K> {
    abstract cache(getValue: (key: K) => Promise<T>, key: K): Promise<T>;

    abstract get(key: K): T | undefined;

    abstract clear(): void;
}

export class CacheSingleton<T> extends Cache<T, void> {
    protected memory: T | undefined;

    async cache(getValue: () => Promise<T>, _: void,): Promise<T> {
        if (this.memory === undefined) {
            this.memory = await getValue();
        }
        return this.memory;
    }

    get(): T | undefined {
        return this.memory;
    }

    clear(): void {
        this.memory = undefined;
    }
}

export class CacheWithMaxSize<T, K> extends Cache<T, K> {
    protected readonly memory: Map<string, T> = new Map<string, T>();

    constructor(readonly maxSize?: number) {
        super();
        if (maxSize && !(maxSize >= 1)) {
            throw new Error('Max size must be at least 1');
        }
    }

    async cache(getValue: (key: K) => Promise<T>, key: K): Promise<T> {
        const keyHash = this.keyHash(key);
        const cachedValue = this.memory.get(keyHash);
        if (cachedValue !== undefined) {
            return cachedValue;
        }
        const result: T = await getValue(key);
        if (this.maxSize && this.memory.size >= this.maxSize) {
            this.memory.delete(this.memory.keys().next().value!);
        }
        this.memory.set(keyHash, result);
        return result;
    }

    get(key: K): T | undefined {
        return this.memory.get(this.keyHash(key));
    }

    clear(): void {
        this.memory.clear();
    }

    keyHash(key: K): string {
        return JSON.stringify(key);
    }
}