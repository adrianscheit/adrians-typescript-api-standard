import {NumberValidator, ValidateNumberOptions} from './number-validator';

describe('number', () => {
    const options: ValidateNumberOptions = {min: 2, max: 10, step: 0.5};
    const validator = new NumberValidator(options);

    it.each([
        undefined,
        null,
        '',
        {},
        [],
        -10,
        -1,
        0,
        1,
        2.1,
        2.6,
        3.2,
        10.1,
        10.0001,
        10.5,
        11,
        15,
        2846465862135,
        28464658621352846465862135n,
    ])('should throw: %s', (invalid: unknown) => {
        expect(() => NumberValidator.validate(invalid, options)).toThrow();
        expect(() => validator.validate(invalid)).toThrow();
    });

    it.each([
        2,
        2.5,
        3,
        4.5,
        6.5,
        8.5,
        9.5,
        10,
    ])('should NOT throw: %s', (valid: unknown) => {
        NumberValidator.validate(valid, options);
        validator.validate(valid);
    });
});