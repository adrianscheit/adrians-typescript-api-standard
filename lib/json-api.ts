export type JsonExchangeHandle<REQ_DTO = any, RES_DTO = any> = (request: REQ_DTO) => Promise<RES_DTO>;


export class JsonExchange<REQ_DTO, RES_DTO> {
    constructor(
        protected readonly options: {
            preProcessor?: (request: REQ_DTO) => void;
            postProcessor?: (response: RES_DTO, request: REQ_DTO) => void;
            handleWrapper?: (request: REQ_DTO, handle: JsonExchangeHandle<REQ_DTO, RES_DTO>) => Promise<RES_DTO>;
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
}

export type JsonExchangeOrExchanges = JsonExchange<any, any> | { [key: string]: JsonExchangeOrExchanges };
export type JsonExchangesRoot = { [key: string]: JsonExchangeOrExchanges };
const extractAllExchangesAsEntries = (jsonExchangeOrExchanges: JsonExchangeOrExchanges, prefix: string = ''): [string, JsonExchange<any, any>][] => {
    if (jsonExchangeOrExchanges instanceof JsonExchange) {
        return [[prefix, jsonExchangeOrExchanges]];
    }
    return Object.entries(jsonExchangeOrExchanges).flatMap(([key, child]) => extractAllExchangesAsEntries(child, `${prefix}${key}.`));
};

export type CustomerHandle<REQ_DTO = any, RES_DTO = any> = (request: REQ_DTO) => Promise<RES_DTO>;
export class JsonExchangeCustomerFetchHandler {
    protected readonly handles: Map<JsonExchange<any, any>, CustomerHandle> = new Map<JsonExchange<any, any>, CustomerHandle>();

    constructor(jsonExchanges: JsonExchangesRoot, readonly authorizationHeader: string = '', readonly backendPrefix: string = '') {
        extractAllExchangesAsEntries(jsonExchanges).forEach(([key, jsonExchange]) =>
            this.handles.set(jsonExchange, (request) => this._exchange(key, request))
        );
    }

    protected async _exchange<REQ, RES>(key: string, request: REQ): Promise<RES> {
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

    exchange<REQ_DTO, RES_DTO>(jsonExchange: JsonExchange<REQ_DTO, RES_DTO>, request: REQ_DTO): Promise<RES_DTO> {
        const handle = this.handles.get(jsonExchange);
        if (handle) {
            return handle(request);
        }
        throw `Exchange not found`;
    }
}

export type ServiceHandle<CustomerContext, REQ_DTO = any, RES_DTO = any> = (request: REQ_DTO, customerContext: CustomerContext) => Promise<RES_DTO>;
export class JsonExchangeServiceHandler<CustomerContext> {
    readonly flattedExchanges: ReadonlyMap<JsonExchange<any, any>, string>;
    protected readonly handles: Map<string, ServiceHandle<CustomerContext>> = new Map<string, ServiceHandle<CustomerContext>>();

    constructor(jsonExchanges: JsonExchangesRoot) {
        this.flattedExchanges = new Map(extractAllExchangesAsEntries(jsonExchanges).map(([a, b]) => [b, a]));
    }

    registerHandle<REQ_DTO, RES_DTO>(jsonExchange: JsonExchange<REQ_DTO, RES_DTO>, handle: ServiceHandle<CustomerContext, REQ_DTO, RES_DTO>): void {
        const key = this.flattedExchanges.get(jsonExchange);
        if (!key) {
            throw new Error(`${key} This exchange was not found!`);
        }
        this.handles.set(key, handle);
    }

    validate(): void {
        const registeredKeys = new Set<string>(this.handles.keys());
        const missingKeys = [...this.flattedExchanges.values()].filter((key) => !registeredKeys.has(key))
        if (missingKeys.length) {
            throw new Error(`There are JSON exchanges with out defined handle: ${missingKeys.join()} `);
        }
    }

    handleRequest(key: string, request: any, customerContext: CustomerContext): Promise<any> {
        const handle = this.handles.get(key);
        if (handle) {
            return handle(request, customerContext);
        }
        throw `Exchange key ${key} not found`;
    }
}

