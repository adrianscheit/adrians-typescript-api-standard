import {JsonExchange} from "./common";

describe('JsonExchange', () => {
    describe('extractAllExchangesAsEntries', () => {
        it('empty object', () => {
            expect(JsonExchange.extractAllExchangesAsEntries({})).toEqual([]);
        });

        it('no object', () => {
            const jsonExchange = new JsonExchange();

            const extractedEntries = JsonExchange._extractAllExchangesAsEntries(jsonExchange);
            expect(extractedEntries[0][1]).toBe('');
            expect(extractedEntries[0][0]).toBe(jsonExchange);
        });

        it.each([
            ``,
            `${JsonExchange.keysSeparator}`,
            `a${JsonExchange.keysSeparator}`,
            `${JsonExchange.keysSeparator}a`,
            `a${JsonExchange.keysSeparator}a`,
            `lots-of-text-and${JsonExchange.keysSeparator}this-should-throw`,
        ])('key name ("%s") should throw', (key) => {
            const jsonExchanges = {[key]: new JsonExchange()};

            expect(() => JsonExchange.extractAllExchangesAsEntries(jsonExchanges)).toThrow();
        });

        it.each([
            `a`,
            `abc-def`,
            `abcDEF`,
            `with space`,
            `Whatever^&(*!@#$%^&*()<>:"{} but no separator`,
        ])('key name ("%s") should work', (key) => {
            const jsonExchange = new JsonExchange();
            const jsonExchanges = {[key]: jsonExchange};

            const result = JsonExchange.extractAllExchangesAsEntries(jsonExchanges);
            expect(result[0][1]).toBe(key);
            expect(result[0][0]).toBe(jsonExchange);
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
                    name6: new JsonExchange(),
                }
            };

            expect(JsonExchange.extractAllExchangesAsEntries(jsonExchangeOrExchanges).map(([_, key]) => key))
                .toEqual([
                    'name1',
                    'group1.name2',
                    'group1.name3',
                    'name4',
                    'group3.group4.name5',
                    'group3.name6',
                ]);
        });
    });
});
