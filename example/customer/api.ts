import {CustomerStrategyInternal} from '../../src/customer/customer';
import {allJsonExchanges} from '../common/api';
import {jsonExchangeServiceAgent} from '../service/api';
import {JsonExchangeCustomerAgent} from '../../src/customer/json-exchange-customer-agent';

export const jsonExchangeCustomerAgent = new JsonExchangeCustomerAgent(
    allJsonExchanges,
    new CustomerStrategyInternal(
        jsonExchangeServiceAgent,
        {userName: 'STUB customerContext!'},
    ),
);
