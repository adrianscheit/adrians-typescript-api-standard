import { JsonExchangeCustomerAgent } from "../../src/customer";
import { apiExchanges } from "../common/api";

const jsonExchangeCustomerFetchHandler = new JsonExchangeCustomerAgent(apiExchanges, 'MOCK AUTH');
