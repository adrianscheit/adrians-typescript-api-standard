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
            this.quantity += item.quantity;
            this.sum += item.sum;
            this.calcMin(item.min!);
            this.calcMax(item.max!);
        }
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
        return { ...this, avg: this.calcAvg() };
    }

    private calcMin(value: number): void {
        if (isNaN(this.min) || !isNaN(value) && value < this.min!) {
            this.min = value;
        }
    }

    private calcMax(value: number): void {
        if (isNaN(this.max) || !isNaN(value) && value > this.max) {
            this.max = value;
        }
    }
}

export class JsonExchangeInMemoryStatistics {
    preProcessorTime = new InMemoryStatistic();
    handleTime = new InMemoryStatistic();
    postProcessorTIme = new InMemoryStatistic();
    success = new InMemoryStatistic();
}