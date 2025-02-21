import {Validation} from '../../src/utils/validation';
import {JsonExchangeInMemoryStatisticsInterface} from '../../src/in-memory-statistic';
import {JsonExchange} from '../../src/json-exchange';

export interface ItemPK {
    id: number;
}

export interface Item extends ItemPK {
    name: string;
    description: string;
    createdBy?: string;
    modifiedBy?: string;
    createdTimeStamp?: number;
    modifiedTimeStamp?: number;
}

export const itemValidation = (item: Item): void => {
    Validation.validateObject(item, {
        requiredKeys: new Set<keyof Item>(['id', 'name', 'description']),
        optionalKeys: new Set<keyof Item>(['createdBy', 'modifiedBy']),
    });
    Validation.validateString(item.name, {minLength: 2, maxLength: 64});
    Validation.validateString(item.description, {minLength: 0, maxLength: 256});
};

export interface SubItem {
    id: number;
    name: string;
    description: string;
    createdBy?: string;
    modifiedBy?: string;
    createdTimeStamp?: number;
    modifiedTimeStamp?: number;
    itemId: number;
}

export interface CustomerContext {
    userName: string;
}

export interface UserData {
    name: string;
    email: string;
    address: string;
}

export const userDataValidation = (userData: UserData): void => {
    Validation.validateObject(userData, {
        requiredKeys: new Set(['name', 'email', 'address']),
    });
    Validation.validateString(userData.name, {minLength: 4, maxLength: 64});
    Validation.validateString(userData.email, {minLength: 0, maxLength: 256});
    Validation.validateString(userData.address, {minLength: 4, maxLength: 256});
};

export const subItemValidation = (subItem: SubItem): void => {
    Validation.validateObject(subItem, {
        requiredKeys: new Set<keyof SubItem>(['id', 'name', 'description', 'itemId']),
        optionalKeys: new Set<keyof SubItem>(['createdBy', 'modifiedBy']),
    });
    Validation.validateString(subItem.name, {minLength: 2, maxLength: 64});
    Validation.validateString(subItem.description, {minLength: 0, maxLength: 256});
    Validation.validateNumber(subItem.itemId);
};

export const allJsonExchanges = {
    item: JsonExchange.generateCRUDExchanges<Item>(itemValidation),
    subItem: {
        ...JsonExchange.generateCUDExchanges<SubItem>(subItemValidation),
        readByItem: new JsonExchange<ItemPK, SubItem[]>(),
    },
    userData: JsonExchange.generateRecordExchanges<UserData>(userDataValidation),
    getCustomerContext: new JsonExchange<void, CustomerContext>(),
    getStats: new JsonExchange<void, { [key: string]: JsonExchangeInMemoryStatisticsInterface }>(),
    getAndResetStats: new JsonExchange<void, { [key: string]: JsonExchangeInMemoryStatisticsInterface }>(),
};
