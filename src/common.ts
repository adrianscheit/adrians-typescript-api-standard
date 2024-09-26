export type JsonExchangeOrExchanges = JsonExchange<any, any> | JsonExchangesRoot;
export type JsonExchangesRoot = { [key: string]: JsonExchangeOrExchanges };

export class JsonExchange<REQ_DTO, RES_DTO> {
    constructor(
        readonly options: {
            preProcessor?: (request: REQ_DTO) => void;
        } = {}
    ) {
    }

    static generateCUDExchanges = <DTO>(preProcessor: (request: DTO) => void) => ({
        create: new JsonExchange<DTO, DTO>({preProcessor}),
        update: new JsonExchange<DTO, DTO>({preProcessor}),
        delete: new JsonExchange<DTO, void>(),
    });

    static generateCRUDExchanges = <DTO>(preProcessor: (request: DTO) => void) => ({
        ...this.generateCUDExchanges<DTO>(preProcessor),
        readAll: new JsonExchange<void, DTO[]>(),
    });

    static generateRecordExchanges = <DTO>(preProcessor: (request: DTO) => void) => ({
        read: new JsonExchange<void, DTO>(),
        update: new JsonExchange<DTO, DTO>({preProcessor}),
    });

    static readonly defaultPathPrefix = '/api/json/' as const;
    static readonly defaultMethod = 'PUT' as const;
    static readonly keysSeparator = '.' as const;

    static extractAllExchangesAsEntries(jsonExchangesRoot: JsonExchangesRoot): [JsonExchange<any, any>, string][] {
        return this._extractAllExchangesAsEntries(jsonExchangesRoot);
    }

    static _extractAllExchangesAsEntries(jsonExchangeOrExchanges: JsonExchangeOrExchanges, prefix: string = ''): [JsonExchange<any, any>, string][] {
        if (jsonExchangeOrExchanges instanceof JsonExchange) {
            return [[jsonExchangeOrExchanges, prefix]];
        }
        return Object.entries(jsonExchangeOrExchanges)
            .flatMap(([key, child]) => {
                if (!key || key.includes(JsonExchange.keysSeparator)) {
                    throw new Error(`Forbidden key component: ${key}`);
                }
                return this._extractAllExchangesAsEntries(child, `${prefix}${prefix ? this.keysSeparator : ''}${key}`);
            });
    }
}
