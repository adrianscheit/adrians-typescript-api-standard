import { JsonExchange, JsonExchangesRoot } from "./common";

export interface CustomerAdapter {
    put<REQ_DTO, RES_DTO>(url: string, body: REQ_DTO): Promise<RES_DTO>;
}

export class CustomerAdapterFetch implements CustomerAdapter {
    constructor(
        readonly headers?: any,
    ) { }

    async put<REQ_DTO, RES_DTO>(url: string, body: REQ_DTO): Promise<RES_DTO> {
        const fetchResponse = await fetch(url, {
            method: JsonExchange.method,
            headers: this.headers,
            body: JSON.stringify(body)
        }
        );
        if (!fetchResponse.ok) {
            throw new Error(await fetchResponse.text());
        }
        return await fetchResponse.json();
    }
}

export class CustomerAdapterAngularHttpClient implements CustomerAdapter {
    constructor(
        readonly httpClient: { put: <RES_DTO>(url: string, body: any, options: any) => { subscribe: (obj: { next: (res: RES_DTO) => void, error: (err: any) => void }) => void } },
        readonly headers?: any,
    ) { }

    async put<REQ_DTO, RES_DTO>(url: string, body: REQ_DTO): Promise<RES_DTO> {
        return new Promise<RES_DTO>((resolve, reject) => this.httpClient
            .put<RES_DTO>(url, body, { headers: this.headers })
            .subscribe({
                next: (res) => resolve(res),
                error: (err) => reject(err),
            })
        )
    }
}

export class JsonExchangeCustomerAgent {
    readonly jsonExchangeToKey: ReadonlyMap<JsonExchange<any, any>, string>;

    constructor(
        jsonExchanges: JsonExchangesRoot,
        readonly backendPrefix: string = '',
        readonly customerAdapter: CustomerAdapter = new CustomerAdapterFetch(),
    ) {
        const entities = JsonExchange.extractAllExchangesAsEntries(jsonExchanges);
        this.jsonExchangeToKey = new Map<JsonExchange<any, any>, string>(entities.map(([a, b]) => [b, a]));

    }

    getUrl(key: string): string {
        return `${this.backendPrefix}${JsonExchange.pathPrefix}${encodeURIComponent(key)}`;
    }

    async exchange<REQ_DTO, RES_DTO>(jsonExchange: JsonExchange<REQ_DTO, RES_DTO>, request: REQ_DTO): Promise<RES_DTO> {
        const key = this.jsonExchangeToKey.get(jsonExchange);
        if (key) {
            jsonExchange.options.preProcessor?.(request);
            const response = await this.customerAdapter.put<REQ_DTO, RES_DTO>(this.getUrl(key), request);
            jsonExchange.options.postProcessor?.(response, request);
            return response;
        }
        throw `Exchange not found`;
    }
}
