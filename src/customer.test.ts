import { JsonExchange } from "./common";
import { JsonExchangeCustomerAgent } from "./customer";
import { JsonExchangeServiceAgent } from "./service";


describe('JsonExchangeCustomerAgent', () => {
    it('exchange with key with special characters and is reversable by service agent', () => {
        const jsonExchanges = {
            'key/with Characters!': new JsonExchange(),
        };
        const agent = new JsonExchangeCustomerAgent(jsonExchanges, { exchange: jest.fn() });

        agent.exchange(jsonExchanges['key/with Characters!'], 1234);
        expect(agent.customerAdapter.exchange).toHaveBeenCalledTimes(1);
        expect(agent.customerAdapter.exchange).toHaveBeenCalledWith('key/with Characters!', 1234);
    });

    it('exchange with unknown exchange', (done) => {
        const agent = new JsonExchangeCustomerAgent({}, { exchange: jest.fn() });

        agent.exchange(new JsonExchange(), {}).catch(() => done());
        expect(agent.customerAdapter.exchange).not.toHaveBeenCalled();
    });

    it('exchange works', async () => {
        const jsonExchanges = { test: new JsonExchange<number, number>() };
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
        const jsonExchanges = { test: new JsonExchange() };
        const agent = new JsonExchangeCustomerAgent(
            {
                test: new JsonExchange({
                    preProcessor: () => {
                        throw new Error();
                    }
                })
            },
            { exchange: jest.fn() }
        );

        agent.exchange(jsonExchanges.test, {}).catch(() => done());
        expect(agent.customerAdapter.exchange).not.toHaveBeenCalled();
    });
});
