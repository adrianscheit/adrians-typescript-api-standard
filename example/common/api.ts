import { BasicValidation } from "../../lib/basic-validation";
import { JsonExchange } from "../../lib/common";

export interface Test1RequestDto {
    test1String: string;
    test1Number: number;
}

export interface Test1ResponseDto {
    test1ResString: string;
    test1ResNumber: number;
}

export interface Test2ResponseDto {
    test2String: string;
    test2Number: number;
}

export interface Test3RequestDto {
    test3String: string;
    test3Number: number;
}

export const apiExchanges = {
    test1: new JsonExchange<Test1RequestDto, Test1ResponseDto>({
        preProcessor: (request) => {
            BasicValidation.validateString(request.test1String, { minLength: 2, maxLength: 50 });
            BasicValidation.validateNumber(request.test1Number, { min: 0, max: 99 });
        }
    }),
    test2: new JsonExchange<undefined, Test2ResponseDto>(),
    test3: new JsonExchange<Test3RequestDto, undefined>(),
    crudTest1: JsonExchange.generateCRUDExchanges<string, Test1RequestDto>((request) => {
        BasicValidation.validateString(request.test1String, { minLength: 2, maxLength: 50 });
        BasicValidation.validateNumber(request.test1Number, { min: 0, max: 99 });
    }),
};
