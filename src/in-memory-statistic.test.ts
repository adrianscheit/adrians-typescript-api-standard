import { InMemoryStatistic } from "./in-memory-statistic";

describe('in-memory-statistic', () => {
    test('calculates for simple example', ()=>{
        const stat = new InMemoryStatistic();
        stat.report(3);
        stat.report(8);
        stat.report(4);

        const dto = JSON.parse(JSON.stringify(stat.getDto()));
        expect(dto.min).toBe(3);
        expect(dto.max).toBe(8);
        expect(dto.avg).toBe(5);
        expect(dto.quantity).toBe(3);
    });
});