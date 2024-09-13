import { BasicValidation } from "../../src/basic-validation";
import { JsonExchange } from "../../src/common";
import { JsonExchangeInMemoryStatistics } from "../../src/in-memory-statistic";

export interface ItemPK {
    id: number;
}

export interface Item extends Partial<ItemPK> {
    name: string;
    description: string;
    createdBy?: string,
    modifiedBy?: string,
}

export const itemValidation = (item: Item): void => {
    BasicValidation.validateString(item.name, { minLength: 2, maxLength: 64 });
    BasicValidation.validateString(item.description, { minLength: 0, maxLength: 256 });
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
    BasicValidation.validateString(subItem.name, { minLength: 2, maxLength: 64 });
    BasicValidation.validateString(subItem.description, { minLength: 0, maxLength: 256 });
    BasicValidation.validateNumber(subItem.itemId);
};

export const apiExchanges = {
    item: JsonExchange.generateCRUDExchanges<Item>(itemValidation),
    subItem: {
        ...JsonExchange.generateCUDExchanges<SubItem>(itemValidation),
        readByItem: new JsonExchange<ItemPK, SubItem[]>(),
    },
    getCustomerContext: new JsonExchange<void, CustomerContext>(),
    getStats: new JsonExchange<void, { [key: string]: JsonExchangeInMemoryStatistics }>(),
};
