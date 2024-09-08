export class InMemoryStatistic {
    private quantity = 0;
    private sum = 0;
    private min = NaN;
    private max = NaN;

    report(value: number): void {
        if (this.quantity === 0) {
            this.max = this.min = value;
        } else {
            if (value > this.max!) {
                this.max = value;
            } else if (value < this.min!) {
                this.min = value;
            }
        }
        this.sum += value;
        ++this.quantity;
    }

    calcAvg(): number {
        if (this.quantity === 0) {
            return NaN;
        }
        return this.sum / this.quantity;
    }

    getDto() {
        return { ...this, avg: this.calcAvg() };
    }
}

export class JsonExchangeInMemoryStatistics {
    requestParsingTime = new InMemoryStatistic();
    preProcessorTime = new InMemoryStatistic();
    handleTime = new InMemoryStatistic();
    postProcessorTIme = new InMemoryStatistic();
    responseStringifyingTIme = new InMemoryStatistic();
    requestSize = new InMemoryStatistic();
    responseSize = new InMemoryStatistic();
    success = new InMemoryStatistic();

    getDto() {
        return Object.fromEntries(Object.entries(this)
            .filter(([_, value]) => value instanceof InMemoryStatistic)
            .map(([_, stat]) => stat.getDto())
        );
    }
}