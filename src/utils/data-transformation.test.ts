import {DataTransformation} from './data-transformation';

describe('DataTransformation', () => {
    it('simple scenario with arrays', () => {
        const entries: [number, number][] = [
            [1, 1],
            [2, 2],
            [2, 3],
            [3, 3],
            [3, 1],
            [3, 3],
        ];

        expect(DataTransformation.ungroup(DataTransformation.groupToArrays(entries))).toStrictEqual(entries);
    });

    it('simple scenario with sets', () => {
        const entries: [number, number][] = [
            [1, 1],
            [2, 2],
            [2, 3],
            [3, 3],
            [3, 1],
            [3, 3],
        ];

        const result = DataTransformation.ungroup(DataTransformation.groupToSets(entries));
        expect(result).not.toStrictEqual(entries);
        expect(entries.pop()).toEqual([3, 3]);
        expect(result).toStrictEqual(entries);
    });

    describe('intersection', () => {
        it('intersection of nothing', () => {
            expect(() => DataTransformation.intersection()).toThrow();
        });

        it('case with 2 sets', () => {
            const set1 = new Set<number>([1, 2, 3, 4]);
            const set2 = new Set<number>([4, 3, 5]);

            expect(DataTransformation.intersection(set1, set2)).toStrictEqual([4, 3]);
        });

        it('case with 3 sets', () => {
            const set1 = new Set<number>([1, 2, 3, 4]);
            const set2 = new Set<number>([3, 9, 1]);
            const set3 = new Set<number>([1, 3, 4, 5]);

            expect(DataTransformation.intersection(set1, set2, set3)).toStrictEqual([3, 1]);
        });
    });
});