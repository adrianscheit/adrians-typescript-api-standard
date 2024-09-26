import {BasicValidation} from "../../src/basic-validation";
import {JsonExchange} from "../../src/common";
import {JsonExchangeInMemoryStatisticsInterface} from "../../src/in-memory-statistic";

export interface ItemPK {
    id: number;
}

export interface Item extends ItemPK {
    name: string;
    description: string;
    createdBy?: string,
    modifiedBy?: string,
}

export const itemValidation = (item: Item): void => {
    BasicValidation.validateObject(item, {
        requiredKeys: new Set<keyof Item>(['id', 'name', 'description']),
        optionalKeys: new Set<keyof Item>(['createdBy', 'modifiedBy']),
    });
    BasicValidation.validateString(item.name, {minLength: 2, maxLength: 64});
    BasicValidation.validateString(item.description, {minLength: 0, maxLength: 256});
};

export interface SubItem {
    id?: number;
    name: string;
    description: string;
    createdBy?: string,
    modifiedBy?: string,
    itemId: number,
}

export interface CustomerContext {
    userName: string,
}

export const subItemValidation = (subItem: SubItem): void => {
    BasicValidation.validateObject(subItem, {
        requiredKeys: new Set<keyof SubItem>(['id', 'name', 'description', 'itemId']),
        optionalKeys: new Set<keyof SubItem>(['createdBy', 'modifiedBy']),
    });
    BasicValidation.validateString(subItem.name, {minLength: 2, maxLength: 64});
    BasicValidation.validateString(subItem.description, {minLength: 0, maxLength: 256});
    BasicValidation.validateNumber(subItem.itemId);
};

export const allJsonExchanges = {
    item: JsonExchange.generateCRUDExchanges<Item>(itemValidation),
    subItem: {
        ...JsonExchange.generateCUDExchanges<SubItem>(subItemValidation),
        readByItem: new JsonExchange<ItemPK, SubItem[]>(),
    },
    getCustomerContext: new JsonExchange<void, CustomerContext>(),
    getStats: new JsonExchange<void, { [key: string]: JsonExchangeInMemoryStatisticsInterface }>(),
    getAndResetStats: new JsonExchange<void, { [key: string]: JsonExchangeInMemoryStatisticsInterface }>(),
};
