import { JsonExchangeBackendHandler } from "../../lib/json-api";
import { apiExchanges } from "../common/api";

apiExchanges.crudTest1.create.setHandle(async (r) => { return r; });
apiExchanges.crudTest1.readSome.setHandle(async (r) => { return []; });

const b = new JsonExchangeBackendHandler(apiExchanges);