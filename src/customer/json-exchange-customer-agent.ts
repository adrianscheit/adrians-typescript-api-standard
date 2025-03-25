import {JsonExchange, JsonExchangesRoot} from '../json-exchange';
import {CustomerStrategy, CustomerStrategyFetch} from './customer';

export class JsonExchangeCustomerAgent {
    readonly jsonExchangeToKey: ReadonlyMap<JsonExchange<any, any>, string>;

    constructor(
        jsonExchanges: JsonExchangesRoot,
        readonly customerAdapter: CustomerStrategy = new CustomerStrategyFetch(),
    ) {
        const entities = JsonExchange.extractAllExchangesAsEntries(jsonExchanges);
        this.jsonExchangeToKey = new Map<JsonExchange<any, any>, string>(entities);

    }

    async exchange<REQ_DTO, RES_DTO>(jsonExchange: JsonExchange<REQ_DTO, RES_DTO>, request: REQ_DTO): Promise<RES_DTO> {
        const key = this.jsonExchangeToKey.get(jsonExchange);
        if (key) {
            await jsonExchange.options.preProcessor?.(request);
            return await this.customerAdapter.exchange<REQ_DTO, RES_DTO>(key, request);
        }
        throw `Exchange not found`;
    }
}