import { JsonExchangeServiceHandler } from "../../lib/service";
import { apiExchanges } from "../common/api";

interface CustomerData {
    name: string;
    email: string;
    permissions: ReadonlySet<string>;
}

const jsonExchangeServiceHandler = new JsonExchangeServiceHandler<CustomerData>(apiExchanges);

jsonExchangeServiceHandler.registerHandle(apiExchanges.crudTest1.create, async (request, _) => {
    return request;
});

jsonExchangeServiceHandler.validate();