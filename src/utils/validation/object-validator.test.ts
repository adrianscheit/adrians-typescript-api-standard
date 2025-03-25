import {ObjectValidator, ValidateObjectOptions} from './object-validator';
import {NumberValidator} from './number-validator';
import {StringValidator} from './string-validator';

describe('object', () => {
    const options: ValidateObjectOptions = {
        requiredKeys: {id: new NumberValidator({}), name: new StringValidator({})},
        optionalKeys: {description: new StringValidator({})},
    };
    const validator = new ObjectValidator(options);

    it.each([
        undefined as any as Object,
        null as any as Object,
        [] as any as Object,
        '' as any as Object,
        0 as any as Object,
        // Wrong keys:
        {id: 123},
        {name: 'Name'},
        {id: 123, name: 'Name', description: 'des', tooMuch: 123},
        // Invalid inner validation:
        {id: 'a', name: 'Name'},
        {id: 123, name: 111, description: 'des'},
        {id: 123, name: 'Name', description: 123},
        {id: 123, name: 'Name', description: {}},
    ])('should throw: %s', (invalid: unknown) => {
        expect(() => ObjectValidator.validate(invalid, options)).toThrow();
        expect(() => validator.validate(invalid)).toThrow();
    });

    it.each([
        {id: 123, name: 'Name'},
        {id: 123, name: 'Name', description: 'des'},
    ])('should NOT throw: %s', (valid: unknown) => {
        ObjectValidator.validate(valid, options);
        validator.validate(valid);
    });
});
