import {JsonExchange} from '../json-exchange';
import {JsonExchangeCustomerAgent} from './json-exchange-customer-agent';

describe('JsonExchangeCustomerAgent', () => {
    it('exchange with key with special characters and is reversable by service agent', (done) => {
        const keyWithSpecialChars = 'key/with Characters!';
        const jsonExchanges = {
            [keyWithSpecialChars]: new JsonExchange<number, void>(),
        };
        const agent = new JsonExchangeCustomerAgent(jsonExchanges, {
            exchange: (key, body): any => {
                expect(key).toBe(keyWithSpecialChars);
                expect(body).toBe(1234);
                done();
            }
        });

        agent.exchange(jsonExchanges[keyWithSpecialChars], 1234);
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

});