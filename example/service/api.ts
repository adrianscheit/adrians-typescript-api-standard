import { JsonExchangeServiceAgent } from "../../src/service";
import { apiExchanges, CustomerContext, Item, SubItem } from "../common/api";

export const jsonExchangeServiceAgent = new JsonExchangeServiceAgent<CustomerContext>(apiExchanges);
const mockItemTable: Item[] = [];
const mockSubItemTable: SubItem[] = [];

jsonExchangeServiceAgent.registerHandle(apiExchanges.item.create, async (request, customerContext) => {
    const id = (mockItemTable[0]?.id ?? 0) + 1;
    mockItemTable.unshift({
        id,
        name: request.name,
        description: request.description,
        createdBy: customerContext.userName,
    }); // INSERT INTO
    return mockItemTable[0];
});

jsonExchangeServiceAgent.registerHandle(apiExchanges.item.readAll, async () => mockItemTable);

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

jsonExchangeServiceAgent.registerHandle(apiExchanges.subItem.create, async (request, customerContext) => {
    const id = (mockSubItemTable[0]?.id ?? 0) + 1;
    mockSubItemTable.unshift({
        id,
        itemId: request.itemId,
        name: request.name,
        description: request.description,
        createdBy: customerContext.userName,
    }); // INSERT INTO
    return mockSubItemTable[0];
});

jsonExchangeServiceAgent.registerHandle(apiExchanges.subItem.readByItem, async (request) =>
    mockSubItemTable
        .filter((subItem) => subItem.itemId === request.id)
);

jsonExchangeServiceAgent.registerHandle(apiExchanges.subItem.update, async (request, customerContext) => {
    const item = mockSubItemTable.find((it) => it.id === request.id)!;
    item.name = request.name;
    item.description = request.description;
    item.itemId = request.itemId;
    item.modifiedBy = customerContext.userName;
    return item;
});

jsonExchangeServiceAgent.registerHandle(apiExchanges.subItem.delete, async (request, customerContext) => {
    const itemIndex = mockSubItemTable.findIndex((it) => it.id === request.id)!;
    const item = mockSubItemTable[itemIndex];
    if (item.name !== request.name ||
        item.description !== request.description ||
        item.createdBy !== request.createdBy ||
        item.modifiedBy !== request.modifiedBy ||
        item.itemId !== request.itemId) {
        throw new Error('This item changed in mean time. Refresh the list and try again');
    }
    mockItemTable.splice(itemIndex);
});

jsonExchangeServiceAgent.registerHandle(apiExchanges.getCustomerContext, jsonExchangeServiceAgent.getCustomerContextEndpointHandle);

jsonExchangeServiceAgent.registerHandle(apiExchanges.getStats, jsonExchangeServiceAgent.getStatsEndpointHandle);

jsonExchangeServiceAgent.validate();

