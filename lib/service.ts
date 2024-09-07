import { JsonExchange, JsonExchangesRoot } from "./common";

export type ServiceHandle<CustomerContext, REQ_DTO = any, RES_DTO = any> = (request: REQ_DTO, customerContext: CustomerContext, key: string) => Promise<RES_DTO>;
export class JsonExchangeServiceHandler<CustomerContext> {
    readonly keyToJsonExchange: ReadonlyMap<string, JsonExchange<any, any>>;
    readonly jsonExchangeToKey: ReadonlyMap<JsonExchange<any, any>, string>;
    protected readonly handles: Map<string, ServiceHandle<CustomerContext>> = new Map<string, ServiceHandle<CustomerContext>>();

    constructor(jsonExchanges: JsonExchangesRoot) {
        const entities = JsonExchange.extractAllExchangesAsEntries(jsonExchanges);
        this.keyToJsonExchange = new Map<string, JsonExchange<any, any>>(entities);
        this.jsonExchangeToKey = new Map<JsonExchange<any, any>, string>(entities.map(([a, b]) => [b, a]));
    }

    registerHandle<REQ_DTO, RES_DTO>(jsonExchange: JsonExchange<REQ_DTO, RES_DTO>, handle: ServiceHandle<CustomerContext, REQ_DTO, RES_DTO>): void {
        const key = this.jsonExchangeToKey.get(jsonExchange);
        if (!key) {
            throw new Error(`${key} This exchange was not found!`);
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

    async handleRequest(key: string, request: any, customerContext: CustomerContext): Promise<any> {
        const handle = this.handles.get(key);
        if (handle) {
            const jsonExchange = this.keyToJsonExchange.get(key)!;
            jsonExchange.options.preProcessor?.(request);
            const response = await handle(request, customerContext, key);
            jsonExchange.options.postProcessor?.(response, request);
            return response;
        }
        throw `Exchange key ${key} not found`;
    }
}

