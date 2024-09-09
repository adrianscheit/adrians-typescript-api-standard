import { JsonExchangeServiceAgent } from "../../src/service";
import { apiExchanges, CustomerContext, Item, SubItem } from "../common/api";

const jsonExchangeServiceAgent = new JsonExchangeServiceAgent<CustomerContext>(apiExchanges);
const mockItemTable: Item[] = [];
const mockSubItemTable: SubItem[] = [];

jsonExchangeServiceAgent.registerHandle(apiExchanges.item.create, async (request, customerContext) => {
    request.id = (mockItemTable[0]?.id ?? 0) + 1;
    request.createdBy = customerContext.userName;
    request.modifiedBy = '';
    mockItemTable.unshift(request); // INSERT INTO
    return request;
});

jsonExchangeServiceAgent.registerHandle(apiExchanges.item.readAll, async () => {
    return mockItemTable;
});

jsonExchangeServiceAgent.registerHandle(apiExchanges.item.update, async (request, customerContext) => {
    const item = mockItemTable.find((it) => it.id === request.id)!;
    item.name = request.name;
    item.description = request.description;
    item.modifiedBy = customerContext.userName;
    return item;
});

jsonExchangeServiceAgent.registerHandle(apiExchanges.item.delete, async (request, customerContext) => {
    const itemIndex = mockItemTable.findIndex((it) => it.id === request.id)!;
    const item = mockItemTable[itemIndex];
    if (item.name !== request.name || item.description !== request.description || item.createdBy !== request.createdBy || item.modifiedBy !== request.modifiedBy) {
        throw new Error('This item changed in mean time. Refresh the list and try again');
    }
    mockItemTable.splice(itemIndex);
});

// TODO: finish this example


jsonExchangeServiceAgent.registerHandle(apiExchanges.getCustomerContext, jsonExchangeServiceAgent.getCustomerContextEndpointHandle);
jsonExchangeServiceAgent.registerHandle(apiExchanges.getStats, jsonExchangeServiceAgent.getStatsEndpointHandle);

jsonExchangeServiceAgent.validate();