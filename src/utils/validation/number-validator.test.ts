import {NumberValidator, ValidateNumberOptions} from "./number-validator";

describe('number', () => {
    const options: ValidateNumberOptions = {min: 2, max: 10, step: 0.5};
    const validator = new NumberValidator(options);

    it.each([
        undefined as any as number,
        null as any as number,
        '' as any as number,
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
    ])('should throw: %s', (invalid: number) => {
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
    ])('should NOT throw: %s', (valid: number) => {
        NumberValidator.validate(valid, options);
        validator.validate(valid);
    });
});