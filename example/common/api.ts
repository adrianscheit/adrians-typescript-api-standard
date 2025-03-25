import {JsonExchangeInMemoryStatisticsInterface} from '../../src/service/in-memory-statistic';
import {JsonExchange} from '../../src/json-exchange';
import {ObjectValidator} from '../../src/utils/validation/object-validator';
import {StringValidator} from '../../src/utils/validation/string-validator';
import {NumberValidator} from '../../src/utils/validation/number-validator';

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

export const itemValidator = new ObjectValidator({
    requiredKeys: {
        id: new NumberValidator({}),
        name: new StringValidator({minLength: 2, maxLength: 64}),
        description: new StringValidator({minLength: 0, maxLength: 256}),
    },
    optionalKeys: {
        createdBy: new StringValidator({}),
        modifiedBy: new StringValidator({}),
    },
});

export const itemValidation = (item: Item): void => {
    itemValidator.validate(item);
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

export const userDataValidator = new ObjectValidator({
    requiredKeys: {
        name: new StringValidator({minLength: 4, maxLength: 64}),
        email: new StringValidator({minLength: 0, maxLength: 256}),
        address: new StringValidator({minLength: 4, maxLength: 256}),
    },
});

export const userDataValidation = (userData: UserData): void => {
    userDataValidator.validate(userData);
};

export const subItemValidator = new ObjectValidator({
    requiredKeys: {
        id: new NumberValidator({}),
        name: new StringValidator({minLength: 2, maxLength: 64}),
        description: new StringValidator({minLength: 0, maxLength: 256}),
        itemId: new NumberValidator({}),
    },
    optionalKeys: {
        createdBy: new StringValidator({}),
        modifiedBy: new StringValidator({}),
    },
});

export const subItemValidation = (subItem: SubItem): void => {
    subItemValidator.validate(subItem);
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
