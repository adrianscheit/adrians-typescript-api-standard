import { JsonExchange, JsonExchangeOrExchanges, JsonExchangesRoot } from "./common";
import { JsonExchangeServiceAgent } from "./service";

export interface CustomerStrategy {
    exchange<REQ_DTO, RES_DTO>(key: string, body: REQ_DTO): Promise<RES_DTO>;
}

export class CustomerStrategyInternal<CustomerContext> implements CustomerStrategy {
    constructor(
        readonly jsonExchangeServiceAgent: JsonExchangeServiceAgent<CustomerContext>,
        public customerContext: CustomerContext,
    ) { }

    async exchange<REQ_DTO, RES_DTO>(key: string, body: REQ_DTO): Promise<RES_DTO> {
        return await this.jsonExchangeServiceAgent.handleRequest(key, body, this.customerContext);
    }
}

const getUrl = (urlPrefix: string, key: string): string => `${urlPrefix}${encodeURIComponent(key)}`;

export class CustomerStrategyFetch implements CustomerStrategy {
    constructor(
        readonly urlPrefix: string = JsonExchange.defaultPathPrefix,
        readonly headers?: any,
    ) { }

    async exchange<REQ_DTO, RES_DTO>(key: string, body: REQ_DTO): Promise<RES_DTO> {
        const fetchResponse = await fetch(getUrl(this.urlPrefix, key), {
            method: JsonExchange.defaultMethod,
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

export class CustomerStrategyAngularHttpClient implements CustomerStrategy {
    constructor(
        readonly httpClient: { request: <RES_DTO>(method: string, url: string, body: any, options: any) => { subscribe: (obj: { next: (res: RES_DTO) => void, error: (err: any) => void }) => void } },
        readonly urlPrefix: string = JsonExchange.defaultPathPrefix,
        readonly method: string = JsonExchange.defaultMethod,
        readonly headers?: any,
    ) { }

    async exchange<REQ_DTO, RES_DTO>(key: string, body: REQ_DTO): Promise<RES_DTO> {
        return new Promise<RES_DTO>((resolve, reject) => this.httpClient
            .request<RES_DTO>(this.method, getUrl(this.urlPrefix, key), body, { headers: this.headers })
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
        readonly customerAdapter: CustomerStrategy = new CustomerStrategyFetch(),
    ) {
        const entities = JsonExchange.extractAllExchangesAsEntries(jsonExchanges);
        this.jsonExchangeToKey = new Map<JsonExchange<any, any>, string>(entities.map(([a, b]) => [b, a]));

    }

    async exchange<REQ_DTO, RES_DTO>(jsonExchange: JsonExchange<REQ_DTO, RES_DTO>, request: REQ_DTO): Promise<RES_DTO> {
        const key = this.jsonExchangeToKey.get(jsonExchange);
        if (key) {
            jsonExchange.options.preProcessor?.(request);
            return await this.customerAdapter.exchange<REQ_DTO, RES_DTO>(key, request);
        }
        throw `Exchange not found`;
    }
}
