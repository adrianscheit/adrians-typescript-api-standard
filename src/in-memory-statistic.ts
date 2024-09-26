import {JsonExchange} from "./common";

export interface InMemInMemoryStatisticDTO {
    quantity: number;
    sum: number;
    min: number;
    max: number;
}

export class InMemoryStatistic implements InMemInMemoryStatisticDTO {
    quantity = 0;
    sum = 0;
    min = NaN;
    max = NaN;

    constructor(...source: InMemInMemoryStatisticDTO[]) {
        for (const item of source) {
            this.add(item);
        }
    }

    add(source: InMemInMemoryStatisticDTO): void {
        this.quantity += source.quantity;
        this.sum += source.sum;
        this.calcMin(source.min!);
        this.calcMax(source.max!);
    }

    report(value: number): void {
        ++this.quantity;
        this.sum += value;
        this.calcMin(value);
        this.calcMax(value);
    }

    calcAvg(): number {
        return this.sum / this.quantity;
    }

    getDtoWithAvg(): InMemInMemoryStatisticDTO {
        return {...this, avg: this.calcAvg()};
    }

    private calcMin(value: number): void {
        if (isNaN(this.min) || value < this.min!) {
            this.min = value;
        }
    }

    private calcMax(value: number): void {
        if (isNaN(this.max) || value > this.max) {
            this.max = value;
        }
    }
}

const JsonExchangeInMemoryStatisticsKeys = ['preProcessorTime', 'handleTime', 'successRate'] as const;
export type JsonExchangeInMemoryStatisticsInterface = {
    [Key in typeof JsonExchangeInMemoryStatisticsKeys[number]]: InMemInMemoryStatisticDTO;
};

export class JsonExchangeInMemoryStatistics implements JsonExchangeInMemoryStatisticsInterface {
    preProcessorTime = new InMemoryStatistic();
    handleTime = new InMemoryStatistic();
    successRate = new InMemoryStatistic();

    constructor(...source: JsonExchangeInMemoryStatisticsInterface[]) {
        for (const item of source) {
            this.add(item);
        }
    }

    add(source: JsonExchangeInMemoryStatisticsInterface): void {
        for (const key of JsonExchangeInMemoryStatisticsKeys) {
            this[key].add(source[key]);
        }
    }

    reset(): void {
        for (const key of JsonExchangeInMemoryStatisticsKeys) {
            this[key] = new InMemoryStatistic();
        }
    }
}

export class ServiceAgentStat {
    readonly stats: { [key: string]: JsonExchangeInMemoryStatistics } = {};

    constructor(readonly keys: string[]) {
        for (const key of keys) {
            this.stats[key] = new JsonExchangeInMemoryStatistics();
        }
    }

    add(): void {
        for (const key of this.keys) {
            this.stats[key].reset();
        }
    }

    reset(): void {
        for (const key of this.keys) {
            this.stats[key].reset();
        }
    }

    static getAllPrefixes(key: string, includingKey: boolean = true): string[] {
        const result: string[] = ['*'];
        for (let i = key.indexOf(JsonExchange.keysSeparator) + 1; i > 0; i = key.indexOf(JsonExchange.keysSeparator, i) + 1) {
            result.push(`${key.substring(0, i)}*`);
        }
        if (includingKey) {
            result.push(key);
        }
        return result;
    }

    static calcAggregates(
        source: { [key: string]: JsonExchangeInMemoryStatisticsInterface },
        includingKeys: boolean = true,
    ): [string, JsonExchangeInMemoryStatisticsInterface][] {
        const result = new Map<string, JsonExchangeInMemoryStatistics>();
        for (const [key, value] of Object.entries(source)) {
            for (const prefix of this.getAllPrefixes(key, includingKeys)) {
                if (result.has(prefix)) {
                    result.get(prefix)!.add(value);
                } else {
                    result.set(prefix, new JsonExchangeInMemoryStatistics(value));
                }
            }
        }
        return [...result].sort(([a], [b]) => a.localeCompare(b))
    }

}