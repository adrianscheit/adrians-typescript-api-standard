import { InMemoryStatistic, JsonExchangeInMemoryStatistics, ServiceAgentStat } from "./in-memory-statistic";

const emptyDtoResult = {
    quantity: 0,
    sum: 0,
    min: NaN,
    max: NaN,
    avg: NaN,
};

describe('in-memory-statistic', () => {
    test('edge case: no data reported', () => {
        const stat = new InMemoryStatistic();

        expect(stat.min).toBe(NaN);
        expect(stat.max).toBe(NaN);
        expect(stat.calcAvg()).toBe(NaN);
        expect(stat.quantity).toBe(0);
        expect(stat.sum).toBe(0);
        expect(stat.getDtoWithAvg()).toEqual(emptyDtoResult);
    });

    test.each([0, 1, 2, 3, 4, 5, 7, 10, 17, 21, 34, 100, -10, 5.5, -3.321])('reported value: %i', (value: number) => {
        const stat = new InMemoryStatistic();
        stat.report(value);

        expect(stat.getDtoWithAvg()).toEqual({
            quantity: 1,
            sum: value,
            min: value,
            max: value,
            avg: value,
        });
    });

    test('calculates for simple example', () => {
        const stat = new InMemoryStatistic();
        stat.report(3);
        stat.report(8);
        stat.report(4);

        const dto = JSON.parse(JSON.stringify(stat.getDtoWithAvg()));
        expect(dto.min).toBe(3);
        expect(dto.max).toBe(8);
        expect(dto.avg).toBe(5);
        expect(dto.quantity).toBe(3);
    });

    test('add does not crash when everything is empty', () => {
        const stat = new InMemoryStatistic();
        stat.add(new InMemoryStatistic());

        expect(stat.getDtoWithAvg()).toEqual(emptyDtoResult);
    });

    test('add works if destination is empty', () => {
        const stat1 = new InMemoryStatistic();
        stat1.report(1);
        stat1.report(3);
        const stat2 = new InMemoryStatistic();
        stat2.add(stat1);

        expect(stat2.getDtoWithAvg()).toEqual({
            quantity: 2,
            sum: 4,
            min: 1,
            max: 3,
            avg: 2,
        });
    });

    test('add works if source is empty', () => {
        const stat = new InMemoryStatistic();
        stat.report(1);
        stat.report(3);
        stat.add(new InMemoryStatistic());

        expect(stat.getDtoWithAvg()).toEqual({
            quantity: 2,
            sum: 4,
            min: 1,
            max: 3,
            avg: 2,
        });
    });

    test('construct from many sources', () => {
        const stat1 = new InMemoryStatistic();
        stat1.report(1);
        stat1.report(3);
        const stat2 = new InMemoryStatistic();
        stat2.report(5);
        stat2.report(3);

        const sumStat = new InMemoryStatistic(stat1, stat2);

        expect(sumStat.getDtoWithAvg()).toEqual({
            quantity: 4,
            sum: 12,
            min: 1,
            max: 5,
            avg: 3,
        });
    });
});

describe('JsonExchangeInMemoryStatistics', () => {
    test('constuctor', () => {
        const source1 = new JsonExchangeInMemoryStatistics();
        source1.handleTime.report(1);
        source1.preProcessorTime.report(3);
        source1.successRate.report(1);
        const source2 = new JsonExchangeInMemoryStatistics();
        source2.handleTime.report(3);
        source2.preProcessorTime.report(5);
        source2.successRate.report(0);
        const stat = new JsonExchangeInMemoryStatistics(source1, source2);

        expect(stat.handleTime.getDtoWithAvg()).toEqual({
            quantity: 2,
            sum: 4,
            min: 1,
            max: 3,
            avg: 2,
        });
        expect(stat.preProcessorTime.getDtoWithAvg()).toEqual({
            quantity: 2,
            sum: 8,
            min: 3,
            max: 5,
            avg: 4,
        });
        expect(stat.successRate.getDtoWithAvg()).toEqual({
            quantity: 2,
            sum: 1,
            min: 0,
            max: 1,
            avg: 0.5,
        });
    });

    test('add', () => {
        const source1 = new JsonExchangeInMemoryStatistics();
        source1.handleTime.report(1);
        source1.preProcessorTime.report(3);
        source1.successRate.report(1);
        const source2 = new JsonExchangeInMemoryStatistics();
        source2.handleTime.report(3);
        source2.preProcessorTime.report(5);
        source2.successRate.report(0);

        source2.add(source1);

        expect(source2.handleTime.getDtoWithAvg()).toEqual({
            quantity: 2,
            sum: 4,
            min: 1,
            max: 3,
            avg: 2,
        });
        expect(source2.preProcessorTime.getDtoWithAvg()).toEqual({
            quantity: 2,
            sum: 8,
            min: 3,
            max: 5,
            avg: 4,
        });
        expect(source2.successRate.getDtoWithAvg()).toEqual({
            quantity: 2,
            sum: 1,
            min: 0,
            max: 1,
            avg: 0.5,
        });
    });

    test('reset', () => {
        const stat = new JsonExchangeInMemoryStatistics();
        stat.handleTime.report(1);
        stat.preProcessorTime.report(3);
        stat.successRate.report(1);

        stat.reset();

        expect(stat.handleTime.getDtoWithAvg()).toEqual(emptyDtoResult);
        expect(stat.preProcessorTime.getDtoWithAvg()).toEqual(emptyDtoResult);
        expect(stat.successRate.getDtoWithAvg()).toEqual(emptyDtoResult);
    });
});

describe('ServiceAgentStat', () => {
    test('constuctor', () => {
        const stat = new ServiceAgentStat(['key1', 'group1.key2', 'key3']);

        expect(stat.stats).toEqual({
            key1: new JsonExchangeInMemoryStatistics(),
            'group1.key2': new JsonExchangeInMemoryStatistics(),
            key3: new JsonExchangeInMemoryStatistics(),
        });
    });

    test('add', () => {
        const source1 = new JsonExchangeInMemoryStatistics();
        source1.handleTime.report(1);
        source1.preProcessorTime.report(3);
        source1.successRate.report(1);
        const source2 = new JsonExchangeInMemoryStatistics();
        source2.handleTime.report(3);
        source2.preProcessorTime.report(5);
        source2.successRate.report(0);

        source2.add(source1);

        expect(source2.handleTime.getDtoWithAvg()).toEqual({
            quantity: 2,
            sum: 4,
            min: 1,
            max: 3,
            avg: 2,
        });
        expect(source2.preProcessorTime.getDtoWithAvg()).toEqual({
            quantity: 2,
            sum: 8,
            min: 3,
            max: 5,
            avg: 4,
        });
        expect(source2.successRate.getDtoWithAvg()).toEqual({
            quantity: 2,
            sum: 1,
            min: 0,
            max: 1,
            avg: 0.5,
        });
    });

    test('reset', () => {
        const stat = new JsonExchangeInMemoryStatistics();
        stat.handleTime.report(1);
        stat.preProcessorTime.report(3);
        stat.successRate.report(1);

        stat.reset();

        expect(stat.handleTime.getDtoWithAvg()).toEqual(emptyDtoResult);
        expect(stat.preProcessorTime.getDtoWithAvg()).toEqual(emptyDtoResult);
        expect(stat.successRate.getDtoWithAvg()).toEqual(emptyDtoResult);
    });
});
