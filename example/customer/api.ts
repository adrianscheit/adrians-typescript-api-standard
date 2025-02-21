import {CustomerStrategyInternal, JsonExchangeCustomerAgent} from '../../src/customer/customer';
import {allJsonExchanges} from '../common/api';
import {jsonExchangeServiceAgent} from '../service/api';

export const jsonExchangeCustomerAgent = new JsonExchangeCustomerAgent(
    allJsonExchanges,
    new CustomerStrategyInternal(
        jsonExchangeServiceAgent,
        {userName: 'STUB customerContext!'},
    ),
);
