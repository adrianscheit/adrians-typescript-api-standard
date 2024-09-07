import { JsonExchange, JsonExchangesRoot } from "./common";

export abstract class CustomerExchange {
    constructor(
        readonly backendPrefix: string = '',
    ) { }

    protected getUrl(key: string): string {
        return `${this.backendPrefix}/api/exchange/${encodeURIComponent(key)}`;
    }
    abstract exchange<REQ_DTO, RES_DTO>(key: string, request: REQ_DTO): Promise<RES_DTO>;
}

export class CustomerExchangeFetch extends CustomerExchange {
    constructor(
        readonly authorizationHeader: string = '',
        backendPrefix: string = '',
    ) {
        super(backendPrefix);
    }

    async exchange<REQ_DTO, RES_DTO>(key: string, request: REQ_DTO): Promise<RES_DTO> {
        const fetchResponse = await fetch(
            this.getUrl(key),
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

export class CustomerExchangeAngularHttpClient extends CustomerExchange {
    constructor(
        readonly httpClient: { put: <RES_DTO>(url: string, body: any, options: any) => { subscribe: (obj: { next: (res: RES_DTO) => void, error: (err: any) => void }) => void } },
        backendPrefix: string = '',
        readonly headers?: any,
    ) {
        super(backendPrefix);
    }

    async exchange<REQ_DTO, RES_DTO>(key: string, request: REQ_DTO): Promise<RES_DTO> {
        return new Promise<RES_DTO>((resolve, reject) => this.httpClient
            .put<RES_DTO>(this.getUrl(key), request, { headers: this.headers })
            .subscribe({
                next: (res) => resolve(res),
                error: (err) => reject(err),
            })
        )
    }
}

export class JsonExchangeCustomerHandler {
    readonly jsonExchangeToKey: ReadonlyMap<JsonExchange<any, any>, string>;

    constructor(
        jsonExchanges: JsonExchangesRoot,
        readonly customerFetchExchange: CustomerExchange,
    ) {
        const entities = JsonExchange.extractAllExchangesAsEntries(jsonExchanges);
        this.jsonExchangeToKey = new Map<JsonExchange<any, any>, string>(entities.map(([a, b]) => [b, a]));

    }

    async exchange<REQ_DTO, RES_DTO>(jsonExchange: JsonExchange<REQ_DTO, RES_DTO>, request: REQ_DTO): Promise<RES_DTO> {
        const key = this.jsonExchangeToKey.get(jsonExchange);
        if (key) {
            jsonExchange.options.preProcessor?.(request);
            const response = await this.customerFetchExchange.exchange<REQ_DTO, RES_DTO>(key, request);
            jsonExchange.options.postProcessor?.(response, request);
            return response;
        }
        throw `Exchange not found`;
    }
}
