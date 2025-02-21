import {CustomerStrategy, JsonExchangeCustomerAgent, JsonExchangeHistory} from "./customer";
import {JsonExchange} from "./json-exchange";

describe('JsonExchangeCustomerAgent', () => {
    it('exchange with key with special characters and is reversable by service agent', () => {
        const jsonExchanges = {
            'key/with Characters!': new JsonExchange(),
        };
        const agent = new JsonExchangeCustomerAgent(jsonExchanges, {exchange: jest.fn()});

        agent.exchange(jsonExchanges['key/with Characters!'], 1234);
        expect(agent.customerAdapter.exchange).toHaveBeenCalledTimes(1);
        expect(agent.customerAdapter.exchange).toHaveBeenCalledWith('key/with Characters!', 1234);
    });

    it('exchange with unknown exchange', (done) => {
        const agent = new JsonExchangeCustomerAgent({}, {exchange: jest.fn()});

        agent.exchange(new JsonExchange(), {}).catch(() => done());
        expect(agent.customerAdapter.exchange).not.toHaveBeenCalled();
    });

    it('exchange works', async () => {
        const jsonExchanges = {test: new JsonExchange<number, number>()};
        const agent = new JsonExchangeCustomerAgent(
            jsonExchanges,
            {
                exchange: async (key, body) => {
                    expect(key).toBe('test');
                    expect(body).toBe(123);
                    return 12345 as any;
                }
            },
        );

        expect(await agent.exchange(jsonExchanges.test, 123)).toBe(12345);
    });

    it('preProcessor fails', (done) => {
        const jsonExchanges = {test: new JsonExchange()};
        const agent = new JsonExchangeCustomerAgent(
            {
                test: new JsonExchange({
                    preProcessor: () => {
                        throw new Error();
                    }
                })
            },
            {exchange: jest.fn()},
        );

        agent.exchange(jsonExchanges.test, {}).catch(() => done());
        expect(agent.customerAdapter.exchange).not.toHaveBeenCalled();
    });

    describe('JsonExchangeCustomerAgent', () => {
        it('exchange pending', () => {
            const customerStrategy: CustomerStrategy = {
                exchange: jest.fn().mockReturnValue(new Promise(() => {
                }))
            };
            const history = new JsonExchangeHistory(customerStrategy);

            history.exchange('abcD', 'body');

            expect(customerStrategy.exchange).toHaveBeenCalledTimes(1);
            expect(customerStrategy.exchange).toHaveBeenCalledWith('abcD', 'body');
            expect(history.pending.size).toBe(1);
            expect(history.success.size).toBe(0);
            expect(history.errored.size).toBe(0);
            expect(history.pending.values().next().value!.key).toBe('abcD');
            expect(history.pending.values().next().value!.startTimestamp).toBeTruthy();
            expect(history.pending.values().next().value!.endTimestamp).toBe(undefined);
        });

        it('exchange success', async () => {
            const customerStrategy: CustomerStrategy = {
                exchange: jest.fn().mockReturnValue(Promise.resolve('success0'))
            };
            const history = new JsonExchangeHistory(customerStrategy);

            expect(await history.exchange('abcD', 'body')).toBe('success0');

            expect(customerStrategy.exchange).toHaveBeenCalledTimes(1);
            expect(customerStrategy.exchange).toHaveBeenCalledWith('abcD', 'body');
            expect(history.pending.size).toBe(0);
            expect(history.success.size).toBe(1);
            expect(history.errored.size).toBe(0);
            expect(history.success.values().next().value!.key).toBe('abcD');
            expect(history.success.values().next().value!.startTimestamp).toBeTruthy();
            expect(history.success.values().next().value!.endTimestamp).toBeTruthy();
        });

        it('exchange errored', (done) => {
            const customerStrategy: CustomerStrategy = {
                exchange: jest.fn().mockReturnValue(Promise.reject('error0'))
            };
            const history = new JsonExchangeHistory(customerStrategy);

            history.exchange('abcD', 'body').catch((e) => {
                expect(e).toBe('error0');

                expect(customerStrategy.exchange).toHaveBeenCalledTimes(1);
                expect(customerStrategy.exchange).toHaveBeenCalledWith('abcD', 'body');
                expect(history.pending.size).toBe(0);
                expect(history.success.size).toBe(0);
                expect(history.errored.size).toBe(1);
                expect(history.errored.values().next().value!.key).toBe('abcD');
                expect(history.errored.values().next().value!.startTimestamp).toBeTruthy();
                expect(history.errored.values().next().value!.endTimestamp).toBeTruthy();

                done();
            });
        });
    });
});
