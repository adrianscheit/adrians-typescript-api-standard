import { JsonExchange, JsonExchangesRoot } from "./common";
import { JsonExchangeInMemoryStatistics } from "./in-memory-statistic";

type JsonExchangeServiceHandle<CustomerContext, REQ_DTO = any, RES_DTO = any> = (request: REQ_DTO, customerContext: CustomerContext, key: string) => Promise<RES_DTO>;
export class JsonExchangeServiceAgent<CustomerContext> {
    readonly keyToJsonExchange: ReadonlyMap<string, JsonExchange<any, any>>;
    readonly jsonExchangeToKey: ReadonlyMap<JsonExchange<any, any>, string>;
    protected readonly handles: Map<string, JsonExchangeServiceHandle<CustomerContext>> = new Map<string, JsonExchangeServiceHandle<CustomerContext>>();
    protected readonly stats: Map<string, JsonExchangeInMemoryStatistics> = new Map<string, JsonExchangeInMemoryStatistics>();

    constructor(jsonExchanges: JsonExchangesRoot) {
        const entities = JsonExchange.extractAllExchangesAsEntries(jsonExchanges);
        this.keyToJsonExchange = new Map<string, JsonExchange<any, any>>(entities);
        this.jsonExchangeToKey = new Map<JsonExchange<any, any>, string>(entities.map(([a, b]) => [b, a]));
    }

    registerHandle<REQ_DTO, RES_DTO>(jsonExchange: JsonExchange<REQ_DTO, RES_DTO>, handle: JsonExchangeServiceHandle<CustomerContext, REQ_DTO, RES_DTO>): void {
        const key = this.jsonExchangeToKey.get(jsonExchange);
        if (!key) {
            throw new Error(`exchange was not found!`);
        }
        if (this.handles.has(key)) {
            throw new Error(`${key} is already registered!`);
        }
        this.handles.set(key, handle);
    }

    validate(): void {
        const registeredKeys = new Set<string>(this.handles.keys());
        const missingKeys = [...this.jsonExchangeToKey.values()].filter((key) => !registeredKeys.has(key))
        if (missingKeys.length) {
            throw new Error(`There are JSON exchanges with out defined handle: ${missingKeys.join()} `);
        }
    }

    async handleRequest(key: string, unparsedRequest: string, customerContext: CustomerContext): Promise<string> {
        const handle = this.handles.get(key);
        if (!handle) {
            throw `Exchange key "${key}" not found!`;
        }
        const jsonExchange = this.keyToJsonExchange.get(key)!;
        const parsedRequest = JSON.parse(unparsedRequest);
        jsonExchange.options.preProcessor?.(parsedRequest);
        const response = await handle(parsedRequest, customerContext, key);
        jsonExchange.options.postProcessor?.(response, parsedRequest);
        return JSON.stringify(response);
    }

    customerContextEndpointHandle: JsonExchangeServiceHandle<CustomerContext, void, CustomerContext> =
        async (_, customerContext) => customerContext;
    statsEndpointHandle: JsonExchangeServiceHandle<CustomerContext, void, { [key: string]: any }> =
        async () => Object.fromEntries([...this.stats].map(([key, stat]) => [key, stat.getDto()]));
}
