import { JsonExchangeCustomerFetchHandler } from "../../lib/json-api";
import { apiExchanges } from "../common/api";

const jsonExchangeCustomerFetchHandler = new JsonExchangeCustomerFetchHandler(apiExchanges, 'MOCK AUTH');

jsonExchangeCustomerFetchHandler.exchange(apiExchanges.crudTest1.create, { test1Number: 123, test1String: 'ABC' });