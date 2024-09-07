import { JsonExchange } from "./common";
import { JsonExchangeServiceHandler } from "./service";

describe('service', () => {
    const oneExchange = {
        onlyOne: new JsonExchange(),
    };
    const fewExchanges = {
        test: new JsonExchange(),
        testNested: {
            c: new JsonExchange(),
            d: new JsonExchange(),
        },
    };

    test('requests are able to be correctly handled', async () => {
        const jsonExchangeServiceHandler = new JsonExchangeServiceHandler(fewExchanges);
        jsonExchangeServiceHandler.registerHandle(fewExchanges.testNested.c, async (request, userContext, key) => {
            expect(request).toBe(1234);
            expect(userContext).toEqual({ user: 'mock' });
            expect(key).toBe('testNested.c');
            return 5678;
        });

        const response = await jsonExchangeServiceHandler.handleRequest('testNested.c', 1234, { user: 'mock' });
        expect(response).toBe(5678);
    });

    test('validate works for one simple exchange', () => {
        const jsonExchangeServiceHandler = new JsonExchangeServiceHandler(oneExchange);

        expect(() => jsonExchangeServiceHandler.validate()).toThrow();
        jsonExchangeServiceHandler.registerHandle(oneExchange.onlyOne, async () => { });
        expect(() => jsonExchangeServiceHandler.validate()).not.toThrow();
    });

    test('validate works for few exchanges', () => {
        const jsonExchangeServiceHandler = new JsonExchangeServiceHandler(fewExchanges);
        jsonExchangeServiceHandler.registerHandle(fewExchanges.test, async () => { });
        jsonExchangeServiceHandler.registerHandle(fewExchanges.testNested.d, async () => { });

        expect(() => jsonExchangeServiceHandler.validate()).toThrow();
        jsonExchangeServiceHandler.registerHandle(fewExchanges.testNested.c, async () => { });
        expect(() => jsonExchangeServiceHandler.validate()).not.toThrow();
    });

    test('double registering an exchange handle should throw', () => {
        const jsonExchangeServiceHandler = new JsonExchangeServiceHandler(oneExchange);
        jsonExchangeServiceHandler.registerHandle(oneExchange.onlyOne, async () => { });

        expect(() => jsonExchangeServiceHandler.registerHandle(oneExchange.onlyOne, async () => { })).toThrow();
    });
});