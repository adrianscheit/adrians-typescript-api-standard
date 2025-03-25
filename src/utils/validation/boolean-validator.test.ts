import {BooleanValidator, ValidateBooleanOptions} from './boolean-validator';

describe('boolean', () => {
    const options: ValidateBooleanOptions = {};
    const validator = new BooleanValidator(options);

    it.each([
        undefined,
        null,
        '',
        -10,
        -1,
        0,
        1,
        2.1,
        {},
        [],
    ])('should throw: %s', (invalid: unknown) => {
        expect(() => BooleanValidator.validate(invalid, options)).toThrow();
        expect(() => validator.validate(invalid)).toThrow();
    });

    it.each([
        false,
        true,
    ])('should NOT throw: %s', (valid: unknown) => {
        BooleanValidator.validate(valid, options);
        validator.validate(valid);
    });
});