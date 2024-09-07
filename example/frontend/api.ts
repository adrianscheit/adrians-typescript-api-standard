import { JsonExchangeFrontendHandler } from "../../lib/json-api";
import { apiExchanges } from "../common/api";

const frontedJsonExchanges = new JsonExchangeFrontendHandler(apiExchanges, 'MOCK AUTH');