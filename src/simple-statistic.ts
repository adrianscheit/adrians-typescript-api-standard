export class SimpleStatistic {
    private quantity = 0;
    private sum = 0;
    private min = NaN;
    private max = NaN;
    private first = true;

    report(value: number): void {
        if (this.first) {
            this.max = this.min = value;
            this.first = false;
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
}

export class SimpleStatistics {
    duration = new SimpleStatistic();
    requestSize = new SimpleStatistic();
    responseSize = new SimpleStatistic();
    success = new SimpleStatistic();

    report(duration: number, requestSize: number, responseSize: number, success: number): void {
        this.duration.report(duration);
        this.requestSize.report(requestSize);
        this.responseSize.report(responseSize);
        this.success.report(success);
    }
}