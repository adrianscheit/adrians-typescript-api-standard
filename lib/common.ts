export type JsonExchangeOrExchanges = JsonExchange<any, any> | { [key: string]: JsonExchangeOrExchanges };
export type JsonExchangesRoot = { [key: string]: JsonExchangeOrExchanges };
export class JsonExchange<REQ_DTO, RES_DTO> {
    constructor(
        readonly options: {
            preProcessor?: (request: REQ_DTO) => void;
            postProcessor?: (response: RES_DTO, request: REQ_DTO) => void;
        } = {}
    ) { }

    static generateCRUDExchanges = <PK, DTO>(preProcessor: (request: DTO) => void | Promise<void>) => ({
        create: new JsonExchange<DTO, DTO>({ preProcessor }),
        readSome: new JsonExchange<PK[], DTO[]>({
            postProcessor: (request, response) => {
                if (request.length !== response.length) {
                    throw new Error('The response is not containing the requests quantity of data')
                }
            }
        }),
        readAll: new JsonExchange<void, PK[]>(),
        update: new JsonExchange<DTO, DTO>({ preProcessor }),
        delete: new JsonExchange<PK, void>(),
    });

    static generateRecordExchanges = <DTO>(preProcessor: (request: DTO) => void | Promise<void>) => ({
        read: new JsonExchange<void, DTO>(),
        update: new JsonExchange<DTO, DTO>({ preProcessor }),
    });

    static extractAllExchangesAsEntries(jsonExchangeOrExchanges: JsonExchangeOrExchanges, prefix: string = ''): [string, JsonExchange<any, any>][] {
        if (jsonExchangeOrExchanges instanceof JsonExchange) {
            return [[prefix, jsonExchangeOrExchanges]];
        }
        return Object.entries(jsonExchangeOrExchanges).flatMap(([key, child]) => this.extractAllExchangesAsEntries(child, `${prefix}${key}.`));
    }
}
