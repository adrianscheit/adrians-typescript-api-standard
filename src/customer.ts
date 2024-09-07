import { JsonExchange, JsonExchangesRoot } from "./common";

export class JsonExchangeCustomerHandler {
    readonly jsonExchangeToKey: ReadonlyMap<JsonExchange<any, any>, string>;

    constructor(
        jsonExchanges: JsonExchangesRoot,
        readonly authorizationHeader: string = '',
        readonly backendPrefix: string = '',
        readonly _exchange: <REQ_DTO, RES_DTO>(key: string, request: REQ_DTO) => Promise<RES_DTO> =
            async <REQ_DTO, RES_DTO>(key: string, request: REQ_DTO): Promise<RES_DTO> => {
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
            },
    ) {
        const entities = JsonExchange.extractAllExchangesAsEntries(jsonExchanges);
        this.jsonExchangeToKey = new Map<JsonExchange<any, any>, string>(entities.map(([a, b]) => [b, a]));

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
