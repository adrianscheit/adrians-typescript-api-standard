export type JsonExchangeOrExchanges = JsonExchange<any, any> | { [key: string]: JsonExchangeOrExchanges };
export type JsonExchangesRoot = { [key: string]: JsonExchangeOrExchanges };
export class JsonExchange<REQ_DTO, RES_DTO> {
    constructor(
        readonly options: {
            preProcessor?: (request: REQ_DTO) => void;
            postProcessor?: (response: RES_DTO, request: REQ_DTO) => void;
        } = {}
    ) { }

    static generateCUDExchanges = <DTO>(preProcessor: (request: DTO) => void) => ({
        create: new JsonExchange<DTO, DTO>({ preProcessor }),
        update: new JsonExchange<DTO, DTO>({ preProcessor }),
        delete: new JsonExchange<DTO, void>(),
    });

    static generateCRUDExchanges = <DTO>(preProcessor: (request: DTO) => void) => ({
        ...this.generateCUDExchanges<DTO>(preProcessor),
        readAll: new JsonExchange<void, DTO[]>(),
    });

    static generateRecordExchanges = <DTO>(preProcessor: (request: DTO) => void) => ({
        read: new JsonExchange<void, DTO>(),
        update: new JsonExchange<DTO, DTO>({ preProcessor }),
    });

    static readonly defaultPathPrefix = '/api/json/';
    static readonly defaultMethod = 'PUT';

    static extractAllExchangesAsEntries(jsonExchangeOrExchanges: JsonExchangeOrExchanges, prefix: string = ''): [string, JsonExchange<any, any>][] {
        if (jsonExchangeOrExchanges instanceof JsonExchange) {
            return [[prefix, jsonExchangeOrExchanges]];
        }
        return Object.entries(jsonExchangeOrExchanges).flatMap(([key, child]) => this.extractAllExchangesAsEntries(child, `${prefix ? prefix + '.' : ''}${key}`));
    }
}
