import { JsonExchange } from "./common";

describe('JsonExchange', () => {
    describe('extractAllExchangesAsEntries', () => {
        it('empty object', () => {
            expect(JsonExchange.extractAllExchangesAsEntries({})).toEqual([]);
        });

        it('no object', () => {
            const jsonExchange = new JsonExchange();

            expect(JsonExchange._extractAllExchangesAsEntries(jsonExchange)).toEqual([
                ['', jsonExchange],
            ]);
        });

        it('normal case', () => {
            const jsonExchangeOrExchanges = {
                name1: new JsonExchange(),
                group1: {
                    name2: new JsonExchange(),
                    name3: new JsonExchange(),
                },
                name4: new JsonExchange(),
                group2: {},
                group3: {
                    group4: {
                        name5: new JsonExchange(),
                    },
                    group5: {},
                }
            };

            expect(JsonExchange.extractAllExchangesAsEntries(jsonExchangeOrExchanges).map((it) => it[0]))
                .toEqual([
                    'name1',
                    'group1.name2',
                    'group1.name3',
                    'name4',
                    'group3.group4.name5',
                ]);
        });
    });
});
