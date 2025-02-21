import {JsonExchangeServiceAgent} from '../service/json-exchange-service-agent';
import {JsonExchange} from '../json-exchange';

export interface CustomerStrategy {
    exchange<REQ_DTO, RES_DTO>(key: string, body: REQ_DTO): Promise<RES_DTO>;
}

export class CustomerStrategyInternal<CustomerContext> implements CustomerStrategy {
    constructor(
        private readonly jsonExchangeServiceAgent: JsonExchangeServiceAgent<CustomerContext>,
        public customerContext: CustomerContext,
    ) {
    }

    async exchange<REQ_DTO, RES_DTO>(key: string, body: REQ_DTO): Promise<RES_DTO> {
        return await this.jsonExchangeServiceAgent.handleRequest(key, body, this.customerContext);
    }
}

const getUrl = (urlPrefix: string, key: string): string => `${urlPrefix}${encodeURIComponent(key)}`;

export class CustomerStrategyFetch implements CustomerStrategy {
    constructor(
        readonly urlPrefix: string = JsonExchange.defaultPathPrefix,
        readonly headers?: any,
    ) {
    }

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
        readonly httpClient: {
            request: <RES_DTO>(method: string, url: string, body: any, options: any) => {
                subscribe: (obj: { next: (res: RES_DTO) => void, error: (err: any) => void }) => void
            }
        },
        readonly urlPrefix: string = JsonExchange.defaultPathPrefix,
        readonly method: string = JsonExchange.defaultMethod,
        readonly headers?: any,
    ) {
    }

    async exchange<REQ_DTO, RES_DTO>(key: string, body: REQ_DTO): Promise<RES_DTO> {
        return new Promise<RES_DTO>((resolve, reject) => this.httpClient
            .request<RES_DTO>(this.method, getUrl(this.urlPrefix, key), body, {headers: this.headers})
            .subscribe({
                next: (res) => resolve(res),
                error: (err) => reject(err),
            })
        )
    }
}

interface HistoryEntry {
    key: string;
    startTimestamp: number;
    endTimestamp?: number;
}

export class JsonExchangeHistory implements CustomerStrategy {
    readonly pending: Set<HistoryEntry> = new Set<HistoryEntry>();
    readonly success: Set<HistoryEntry> = new Set<HistoryEntry>();
    readonly errored: Set<HistoryEntry> = new Set<HistoryEntry>();

    constructor(private readonly customerStrategy: CustomerStrategy) {
    }

    async exchange<REQ_DTO, RES_DTO>(key: string, body: REQ_DTO): Promise<RES_DTO> {
        const historyEntry: HistoryEntry = {key, startTimestamp: Date.now()};
        this.pending.add(historyEntry)
        try {
            const result = await this.customerStrategy.exchange<REQ_DTO, RES_DTO>(key, body);
            this.success.add(historyEntry);
            return result
        } catch (e) {
            this.errored.add(historyEntry);
            throw e;
        } finally {
            this.pending.delete(historyEntry);
            historyEntry.endTimestamp = Date.now();
        }
    }
}

