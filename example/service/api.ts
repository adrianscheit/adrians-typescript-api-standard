import {JsonExchangeServiceAgent} from "../../src/service";
import {allJsonExchanges, CustomerContext, Item, SubItem} from "../common/api";

export const jsonExchangeServiceAgent = new JsonExchangeServiceAgent<CustomerContext>(allJsonExchanges);
const mockItemTable: Item[] = [];
const mockSubItemTable: SubItem[] = [];

jsonExchangeServiceAgent.registerHandle(allJsonExchanges.item.create, async (request, customerContext) => {
    const id = (mockItemTable[0]?.id ?? 0) + 1;
    mockItemTable.unshift({
        id,
        name: request.name,
        description: request.description,
        createdBy: customerContext.userName,
    }); // INSERT INTO
    return mockItemTable[0];
});

jsonExchangeServiceAgent.registerHandle(allJsonExchanges.item.readAll, async () => mockItemTable);

jsonExchangeServiceAgent.registerHandle(allJsonExchanges.item.update, async (request, customerContext) => {
    const item = mockItemTable.find((it) => it.id === request.id)!;
    item.name = request.name;
    item.description = request.description;
    item.modifiedBy = customerContext.userName;
    return item;
});

jsonExchangeServiceAgent.registerHandle(allJsonExchanges.item.delete, async (request, customerContext) => {
    const itemIndex = mockItemTable.findIndex((it) => it.id === request.id)!;
    const item = mockItemTable[itemIndex];
    if (item.name !== request.name || item.description !== request.description || item.createdBy !== request.createdBy || item.modifiedBy !== request.modifiedBy) {
        throw new Error('This item changed in mean time. Refresh the list and try again');
    }
    mockItemTable.splice(itemIndex);
});

jsonExchangeServiceAgent.registerHandle(allJsonExchanges.subItem.create, async (request, customerContext) => {
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

jsonExchangeServiceAgent.registerHandle(allJsonExchanges.subItem.readByItem, async (request) =>
    mockSubItemTable
        .filter((subItem) => subItem.itemId === request.id)
);

jsonExchangeServiceAgent.registerHandle(allJsonExchanges.subItem.update, async (request, customerContext) => {
    const item = mockSubItemTable.find((it) => it.id === request.id)!;
    item.name = request.name;
    item.description = request.description;
    item.itemId = request.itemId;
    item.modifiedBy = customerContext.userName;
    return item;
});

jsonExchangeServiceAgent.registerHandle(allJsonExchanges.subItem.delete, async (request, customerContext) => {
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

jsonExchangeServiceAgent.registerHandle(allJsonExchanges.getCustomerContext, jsonExchangeServiceAgent.handlesPreset.getCustomerContext);
jsonExchangeServiceAgent.registerHandle(allJsonExchanges.getStats, jsonExchangeServiceAgent.handlesPreset.getStats);
jsonExchangeServiceAgent.registerHandle(allJsonExchanges.getAndResetStats, jsonExchangeServiceAgent.handlesPreset.getAndResetStats);

jsonExchangeServiceAgent.validate();

