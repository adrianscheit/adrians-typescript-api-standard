export class BucketSort<T> {
    readonly empty: ReadonlySet<T>;
    readonly sorted: ReadonlyMap<string, ReadonlySet<T>>;

    constructor(data: Iterable<T>, extract: (item: T) => string[]) {
        const empty = new Set<T>();
        const sorted = new Map<string, Set<T>>();
        for (const item of data) {
            const extracted = extract(item);
            if (extracted.length) {
                for (const extractedValue of extracted) {
                    const set = sorted.get(extractedValue) || new Set<T>();
                    if (!set.size) {
                        sorted.set(extractedValue, set);
                    }
                    set.add(item);
                }
            } else {
                empty.add(item);
            }
        }
        this.empty = empty;
        this.sorted = sorted;
    }
}