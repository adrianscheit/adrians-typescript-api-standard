import {CacheSingleton, CacheWithMaxSize} from './cache';

describe('Cache', () => {
    describe('CacheSingleton', () => {
        it('simple scenario', async () => {
            const cacheSingleton = new CacheSingleton();

            expect(cacheSingleton.get()).toBe(undefined);
            expect(await cacheSingleton.cache(async () => 12345678)).toBe(12345678);
            expect(cacheSingleton.get()).toBe(12345678);
            cacheSingleton.clear();
            expect(cacheSingleton.get()).toBe(undefined);
        });

        it('the getValue function is not called twice', async () => {
            const cacheSingleton = new CacheSingleton();
            await cacheSingleton.cache(async () => 1);
            const getValue = jest.fn();

            await cacheSingleton.cache(getValue);

            expect(getValue).not.toHaveBeenCalled();
        });
    });

    describe('CacheWithMaxSize', () => {
        it('simple scenario', async () => {
            const cacheWithMaxSize = new CacheWithMaxSize<string, number>();
            const getValue = async (value: number) => value.toString().repeat(value);

            expect(cacheWithMaxSize.get(2)).toBe(undefined);
            expect(cacheWithMaxSize.get(3)).toBe(undefined);
            expect(cacheWithMaxSize.get(4)).toBe(undefined);
            expect(await cacheWithMaxSize.cache(getValue, 2)).toBe('22');
            expect(await cacheWithMaxSize.cache(getValue, 3)).toBe('333');
            expect(cacheWithMaxSize.get(2)).toBe('22');
            expect(cacheWithMaxSize.get(3)).toBe('333');
            expect(cacheWithMaxSize.get(4)).toBe(undefined);
            cacheWithMaxSize.clear();
            expect(cacheWithMaxSize.get(2)).toBe(undefined);
            expect(cacheWithMaxSize.get(3)).toBe(undefined);
            expect(cacheWithMaxSize.get(4)).toBe(undefined);
        });

        it('the getValue function is not called twice for the same key', async () => {
            const cacheWithMaxSize = new CacheWithMaxSize<string, number>();
            await cacheWithMaxSize.cache(async (_) => 'result', 1);
            const getValue = jest.fn();

            await cacheWithMaxSize.cache(getValue, 1); // the same key

            expect(getValue).not.toHaveBeenCalled();

            await cacheWithMaxSize.cache(getValue, 2); // different key

            expect(getValue).toHaveBeenCalledTimes(1);
        });

        it('maxSize works', async () => {
            const cacheWithMaxSize = new CacheWithMaxSize<string, number>(1);
            await cacheWithMaxSize.cache(async (_) => 'result', 1);
            await cacheWithMaxSize.cache(async (_) => 'result', 2);
            const getValue = jest.fn();

            await cacheWithMaxSize.cache(getValue, 2);

            expect(getValue).not.toHaveBeenCalled();

            await cacheWithMaxSize.cache(getValue, 1);

            expect(getValue).toHaveBeenCalledTimes(1);
        });
    });
});