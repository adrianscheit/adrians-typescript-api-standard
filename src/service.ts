import { JsonExchange, JsonExchangesRoot } from "./common";
import { InMemoryStatistic, JsonExchangeInMemoryStatistics } from "./in-memory-statistic";

type JsonExchangeServiceHandle<CustomerContext, REQ_DTO, RES_DTO> = (request: REQ_DTO, customerContext: CustomerContext, key: string) => Promise<RES_DTO>;
interface KeyMapping<CustomerContext> {
    handle: JsonExchangeServiceHandle<CustomerContext, any, any>,
    statistic: JsonExchangeInMemoryStatistics,
}
export class JsonExchangeServiceAgent<CustomerContext> {
    readonly keyToJsonExchange: ReadonlyMap<string, JsonExchange<any, any>>;
    readonly jsonExchangeToKey: ReadonlyMap<JsonExchange<any, any>, string>;
    readonly keyMappings: Map<string, KeyMapping<CustomerContext>> = new Map<string, KeyMapping<CustomerContext>>();

    constructor(jsonExchanges: JsonExchangesRoot) {
        const entities = JsonExchange.extractAllExchangesAsEntries(jsonExchanges);
        this.keyToJsonExchange = new Map<string, JsonExchange<any, any>>(entities);
        this.jsonExchangeToKey = new Map<JsonExchange<any, any>, string>(entities.map(([a, b]) => [b, a]));
    }

    registerHandle<REQ_DTO, RES_DTO>(jsonExchange: JsonExchange<REQ_DTO, RES_DTO>, handle: JsonExchangeServiceHandle<CustomerContext, REQ_DTO, RES_DTO>): void {
        const key = this.jsonExchangeToKey.get(jsonExchange);
        if (key === undefined) {
            throw new Error(`exchange was not found!`);
        }
        if (this.keyMappings.has(key)) {
            throw new Error(`${key} is already registered!`);
        }
        this.keyMappings.set(key, { handle, statistic: new JsonExchangeInMemoryStatistics() });
    }

    validate(): void {
        const registeredKeys = new Set<string>(this.keyMappings.keys());
        const missingKeys = [...this.jsonExchangeToKey.values()].filter((key) => !registeredKeys.has(key))
        if (missingKeys.length) {
            throw new Error(`There are JSON exchanges with out defined handle: ${missingKeys.join()} `);
        }
    }

    async handleRequest(key: string, unparsedRequest: string, customerContext: CustomerContext): Promise<string> {
        const keyMapping = this.keyMappings.get(key);
        if (!keyMapping) {
            throw `Exchange key "${key}" not found!`;
        }
        try {
            const jsonExchange = this.keyToJsonExchange.get(key)!;
            keyMapping.statistic.requestLength.report(unparsedRequest.length);
            const parsedRequest = await JsonExchangeServiceAgent.timeMeasure(keyMapping.statistic.requestParsingTime, async () => JSON.parse(unparsedRequest));
            JsonExchangeServiceAgent.timeMeasure(keyMapping.statistic.preProcessorTime, async () => jsonExchange.options.preProcessor?.(parsedRequest));
            const response = await JsonExchangeServiceAgent.timeMeasure(keyMapping.statistic.handleTime, async () => keyMapping.handle(parsedRequest, customerContext, key));
            JsonExchangeServiceAgent.timeMeasure(keyMapping.statistic.postProcessorTIme, async () => jsonExchange.options.postProcessor?.(response, parsedRequest));
            const stringifiedResponse = await JsonExchangeServiceAgent.timeMeasure(keyMapping.statistic.responseStringifyingTIme, async () => JSON.stringify(response));
            keyMapping.statistic.responseLength.report(stringifiedResponse.length);
            keyMapping.statistic.success.report(1);
            return stringifiedResponse;
        } catch (err) {
            keyMapping.statistic.success.report(0);
            throw err;
        }
    }

    getKeyIfMatch(incomingMessage: { method: string, url: string }): string {
        if (incomingMessage.method === JsonExchange.method && incomingMessage.url.startsWith(JsonExchange.pathPrefix)) {
            return decodeURIComponent(incomingMessage.url.substring(JsonExchange.pathPrefix.length));
        }
        return '';
    }

    getCustomerContextEndpointHandle: JsonExchangeServiceHandle<CustomerContext, void, CustomerContext> =
        async (_, customerContext) => customerContext;
    getStatsEndpointHandle: JsonExchangeServiceHandle<CustomerContext, void, { [key: string]: any }> =
        async () => Object.fromEntries([...this.keyMappings].map(([key, keyMapping]) => [key, keyMapping.statistic.getDto()]));

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
