export type JsonExchangeOrExchanges = JsonExchange<any, any> | { [key: string]: JsonExchangeOrExchanges };
export type JsonExchangesRoot = { [key: string]: JsonExchangeOrExchanges };
export class JsonExchange<REQ_DTO, RES_DTO> {
    constructor(
        readonly options: {
            preProcessor?: (request: REQ_DTO) => void;
            postProcessor?: (response: RES_DTO, request: REQ_DTO) => void;
        } = {}
    ) { }

    static generateCRUDJsonExchanges = <PK, DTO>(preProcessor: (request: DTO) => void | Promise<void>) => ({
        create: new JsonExchange<DTO, DTO>({ preProcessor }),
        readSome: new JsonExchange<PK[], DTO[]>({
            postProcessor: (request, response) => {
                if (request.length !== response.length) {
                    throw new Error('The response is not containing the requests quantity of data')
                }
            }
        }),
        readAll: new JsonExchange<void, PK[]>(),
        update: new JsonExchange<DTO, DTO>({ preProcessor }),
        delete: new JsonExchange<PK, void>(),
    });

    static extractAllExchangesAsEntries(jsonExchangeOrExchanges: JsonExchangeOrExchanges, prefix: string = ''): [string, JsonExchange<any, any>][] {
        if (jsonExchangeOrExchanges instanceof JsonExchange) {
            return [[prefix, jsonExchangeOrExchanges]];
        }
        return Object.entries(jsonExchangeOrExchanges).flatMap(([key, child]) => this.extractAllExchangesAsEntries(child, `${prefix}${key}.`));
    }
}

export class JsonExchangeCustomerFetchHandler {
    readonly jsonExchangeToKey: ReadonlyMap<JsonExchange<any, any>, string>;

    constructor(jsonExchanges: JsonExchangesRoot, readonly authorizationHeader: string = '', readonly backendPrefix: string = '') {
        const entities = JsonExchange.extractAllExchangesAsEntries(jsonExchanges);
        this.jsonExchangeToKey = new Map<JsonExchange<any, any>, string>(entities.map(([a, b]) => [b, a]));

    }

    protected async _exchange<REQ_DTO, RES_DTO>(key: string, request: REQ_DTO): Promise<RES_DTO> {
        const fetchResponse = await fetch(
            `${this.backendPrefix}/api/exchange/${encodeURIComponent(key)}`,
            {
                method: 'PUT',
                headers: { Authorization: this.authorizationHeader },
                body: JSON.stringify(request),
            },
        );
        if (!fetchResponse.ok) {
            throw new Error(await fetchResponse.text());
        }
        return await fetchResponse.json();
    }

    async exchange<REQ_DTO, RES_DTO>(jsonExchange: JsonExchange<REQ_DTO, RES_DTO>, request: REQ_DTO): Promise<RES_DTO> {
        const key = this.jsonExchangeToKey.get(jsonExchange);
        if (key) {
            jsonExchange.options.preProcessor?.(request);
            const response = await this._exchange<REQ_DTO, RES_DTO>(key, request);
            jsonExchange.options.postProcessor?.(response, request);
            return response;
        }
        throw `Exchange not found`;
    }
}

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

