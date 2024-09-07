export type JsonExchangeHandle<REQ_DTO, RES_DTO> = (request: REQ_DTO) => Promise<RES_DTO>;
export type CRUD_OPERATIONS = 'create' | 'read' | 'readAll' | 'update' | 'delete';


export class JsonExchange<REQ_DTO, RES_DTO> {
    private _handle?: JsonExchangeHandle<REQ_DTO, RES_DTO>;

    constructor(
        protected readonly options: {
            preProcessor?: (request: REQ_DTO) => void;
            postProcessor?: (response: RES_DTO, request: REQ_DTO) => void;
            handleWrapper?: (request: REQ_DTO, handle: JsonExchangeHandle<REQ_DTO, RES_DTO>) => Promise<RES_DTO>;
        } = {}
    ) { }

    hasHandle(): boolean {
        return !!this._handle;
    }

    async handle(request: REQ_DTO): Promise<RES_DTO> {
        this.options.preProcessor?.(request);
        const response = this.options.handleWrapper ? await this.options.handleWrapper(request, this._handle!) : await this._handle!(request);
        this.options.postProcessor?.(response, request);
        return response;
    }

    setHandle(handle: JsonExchangeHandle<REQ_DTO, RES_DTO>): void {
        if (this.hasHandle()) {
            throw new Error(`There is already a registered handle`);
        }
        this._handle = handle;
    }


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

export type JsonExchanges = { [key: string]: JsonExchange<any, any> | JsonExchanges };
export const extractAllExchanges = (jsonExchange: JsonExchanges | JsonExchange<any, any>, prefix: string = ''): { [key: string]: JsonExchange<any, any> } => {
    if (jsonExchange instanceof JsonExchange) {
        return { [prefix]: jsonExchange };
    }
    return Object.fromEntries(Object.entries(jsonExchange).flatMap(([key, value]) => Object.entries(extractAllExchanges(value, prefix + '.' + key))));
};

export class JsonExchangeFrontendHandler {
    constructor(jsonExchanges: JsonExchanges, readonly authorizationHeader: string = '', readonly backendPrefix: string = '') {
        Object.entries(extractAllExchanges(jsonExchanges)).forEach(([key, jsonExchange]) => jsonExchange.setHandle((request) => this.send(key, request)));
    }

    protected async send<REQ, RES>(key: string, request: REQ): Promise<RES> {
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
}

export class JsonExchangeBackendHandler {
    readonly flattedExchanges: ReadonlyMap<string, JsonExchange<any, any>>;

    constructor(jsonExchanges: JsonExchanges) {
        const flattenEntries = Object.entries(extractAllExchanges(jsonExchanges));
        const missingKeys = flattenEntries
            .filter(([_, jsonExchange]) => !jsonExchange.hasHandle())
            .map(([key]) => key);
        if (missingKeys.length) {
            throw new Error(`There are JSON exchanges with out defined handle: ${missingKeys.join()} `);
        }
        this.flattedExchanges = new Map(flattenEntries);
    }

    handle(key: string, request: any): Promise<any> {
        const jsonExchange = this.flattedExchanges.get(key);
        if (jsonExchange) {
            return jsonExchange.handle(request);
        }
        throw `Exchange key ${key} not found`;
    }
}

