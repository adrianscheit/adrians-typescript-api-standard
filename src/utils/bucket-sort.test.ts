import {BucketSort} from "./bucket-sort";

describe('BucketSort', () => {
    test('simple sort', () => {
        interface T {
            a: string[];
            b: string;
        }

        const data: T[] = [
            {a: ['1', '2'], b: 'AAA'},
            {a: ['3', '2'], b: 'BBB'},
            {a: ['3', '1'], b: 'CCC'},
            {a: [], b: 'DDD'},
            {a: ['2'], b: 'EEE'},
        ];

        const instance = new BucketSort<T>(data, (row) => row.a);

        expect(instance.empty).toEqual(new Set([data[3]]));
        expect(instance.sorted).toEqual(new Map<string, Set<T>>([
            ['1', new Set([data[0], data[2]])],
            ['2', new Set([data[0], data[1], data[4]])],
            ['3', new Set([data[1], data[2]])],
        ]));
    });

    test('sort map', () => {
        const data = new Map<number, string[]>([
            [1, ['A']],
            [2, []],
            [3, ['C', 'A']],
        ]);

        const instance = new BucketSort<[number, string[]]>(data, ([n, s]) => s);

        expect(instance.empty).toEqual(new Set([[2, []]]));
        expect(instance.sorted).toEqual(new Map([
            ['A', new Set([[1, ['A']], [3, ['C', 'A']]])],
            ['C', new Set([[3, ['C', 'A']]])],
        ]));
    });
});