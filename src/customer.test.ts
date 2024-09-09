import { JsonExchange } from "./common";
import { JsonExchangeCustomerAgent } from "./customer";
import { JsonExchangeServiceAgent } from "./service";


describe('JsonExchangeCustomerAgent', () => {
    it('getUrl works with keys with special characters and is reversable by service agent', () => {
        const key = 'key/with Characters!';
        const agent = new JsonExchangeCustomerAgent({}, 'https://test.com:8080', { put: jest.fn() });

        expect(agent.getUrl(key)).toBe('https://test.com:8080/api/json/key%2Fwith%20Characters!');
        expect(agent.customerAdapter.put).not.toHaveBeenCalled();
        expect(new JsonExchangeServiceAgent({})
            .getKeyIfMatch({ method: JsonExchange.method, url: agent.getUrl(key).substring(agent.backendPrefix.length) })
        ).toBe(key);
    });

    it('exchange with unknown exchange', (done) => {
        const agent = new JsonExchangeCustomerAgent({}, 'https://test.com:8080', { put: jest.fn() });

        agent.exchange(new JsonExchange(), {}).catch(() => done());
        expect(agent.customerAdapter.put).not.toHaveBeenCalled();
    });

    it('exchange works', async () => {
        const jsonExchanges = { test: new JsonExchange<number, number>() };
        const agent = new JsonExchangeCustomerAgent(
            jsonExchanges,
            'https://test.com:8080',
            {
                put: async (url, body) => {
                    expect(url).toBe('https://test.com:8080/api/json/test');
                    expect(body).toBe(123);
                    return 12345 as any;
                }
            }
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
            'https://test.com:8080',
            { put: jest.fn() }
        );

        agent.exchange(jsonExchanges.test, {}).catch(() => done());
        expect(agent.customerAdapter.put).not.toHaveBeenCalled();
    });
});
