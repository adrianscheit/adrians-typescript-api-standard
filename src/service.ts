import {JsonExchange, JsonExchangesRoot} from "./common";
import {InMemoryStatistic, ServiceAgentStat} from "./in-memory-statistic";

type JsonExchangeServiceHandle<CustomerContext, REQ_DTO, RES_DTO> = (request: REQ_DTO, customerContext: CustomerContext, key: string) => Promise<RES_DTO>;
export class JsonExchangeServiceAgent<CustomerContext> {
    readonly handles: Map<string, JsonExchangeServiceHandle<CustomerContext, any, any>> = new Map<string, JsonExchangeServiceHandle<CustomerContext, any, any>>();

    readonly keyToJsonExchange: ReadonlyMap<string, JsonExchange<any, any>>;
    readonly jsonExchangeToKey: ReadonlyMap<JsonExchange<any, any>, string>;
    readonly stats: ServiceAgentStat;

    readonly handlesPreset: { [key: string]: JsonExchangeServiceHandle<CustomerContext, any, any> } = {
        getCustomerContext: async (_, customerContext) => customerContext,
        getStats: async () => this.stats.stats,
        getAndResetStats: async () => {
            const response = this.stats.stats;
            this.stats.reset();
            return response;
        },
    };

    constructor(
        jsonExchanges: JsonExchangesRoot,
        readonly urlPrefix: string = JsonExchange.defaultPathPrefix,
        readonly method: string = JsonExchange.defaultMethod,
    ) {
        const entities = JsonExchange.extractAllExchangesAsEntries(jsonExchanges);
        this.keyToJsonExchange = new Map<string, JsonExchange<any, any>>(entities.map(([a, b]) => [b, a]));
        this.jsonExchangeToKey = new Map<JsonExchange<any, any>, string>(entities);
        this.stats = new ServiceAgentStat([...this.keyToJsonExchange.keys()]);
    }

    registerHandle<REQ_DTO, RES_DTO>(jsonExchange: JsonExchange<REQ_DTO, RES_DTO>, handle: JsonExchangeServiceHandle<CustomerContext, REQ_DTO, RES_DTO>): void {
        const key = this.jsonExchangeToKey.get(jsonExchange);
        if (key === undefined) {
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

    async handleRequest(key: string, request: any, customerContext: CustomerContext): Promise<any> {
        const handle = this.handles.get(key);
        if (!handle) {
            throw `Exchange key "${key}" not found!`;
        }
        const stat = this.stats.stats[key];
        try {
            const jsonExchange = this.keyToJsonExchange.get(key)!;
            if (jsonExchange.options.preProcessor) {
                await JsonExchangeServiceAgent.timeMeasure(
                    stat.preProcessorTime,
                    async () => jsonExchange.options.preProcessor!(request),
                );
            }
            const response = await JsonExchangeServiceAgent.timeMeasure(
                stat.handleTime,
                async () => handle(request, customerContext, key),
            );
            stat.successRate.report(1);
            return response;
        } catch (err) {
            stat.successRate.report(0);
            throw err;
        }
    }

    getKeyIfMatch(incomingMessage: { method?: string, url?: string }): string {
        if (incomingMessage.method === this.method && incomingMessage.url?.startsWith(this.urlPrefix)) {
            return decodeURIComponent(incomingMessage.url.substring(this.urlPrefix.length));
        }
        return '';
    }

    static async timeMeasure<RET>(statistic: InMemoryStatistic, toMeasure: () => Promise<RET>): Promise<RET> {
        const startTime = this.getCurrentTime();
        const result = await toMeasure();
        statistic.report(Number(this.getCurrentTime() - startTime));
        return result;
    }

    static getCurrentTime(): bigint {
        return process.hrtime.bigint();
    }
}
