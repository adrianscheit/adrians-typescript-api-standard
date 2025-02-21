export class DataTransformation {
    static groupToArrays<K, V>(entries: [K, V][]): Map<K, V[]> {
        const result = new Map<K, V[]>();
        for (let [key, value] of entries) {
            let array = result.get(key);
            if (array === undefined) {
                array = [];
                result.set(key, array);
            }
            array.push(value);
        }
        return result;
    }

    static groupToSets<K, V>(entries: [K, V][]): Map<K, Set<V>> {
        const result = new Map<K, Set<V>>();
        for (let [key, value] of entries) {
            let set = result.get(key);
            if (set === undefined) {
                set = new Set<V>();
                result.set(key, set);
            }
            set.add(value);
        }
        return result;
    }

    static ungroup<K, V>(map: ReadonlyMap<K, Iterable<V>>): [K, V][] {
        return [...map.entries()].flatMap(([key, values]) => [...values].map((value): [K, V] => [key, value]));
    }

    static intersection<T>(...sets: ReadonlySet<T>[]): T[] {
        if (sets.length === 0) {
            throw new Error('intersection of nothing is forbidden');
        }
        sets.sort((a, b) => a.size - b.size);
        const shortestSet = sets.shift()!;
        return [...shortestSet].filter((v: T) => !sets.some((set) => !set.has(v)));
    }
}