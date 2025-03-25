import {StringValidator, ValidateStringOptions} from './string-validator';

describe('string', () => {
    const options: ValidateStringOptions = {
        minLength: 3,
        maxLength: 7,
        regExp: /^[A-Z]*$/,
    };
    const validator = new StringValidator(options);

    it.each([
        undefined,
        null,
        4,
        {},
        {AAA: 'AAA'},
        [],
        '',
        'A',
        'AB',
        'AB!',
        'A#BC',
        'AB&C',
        '(ABC',
        'ABC)',
        'ABCDEFGH',
        'ABCDEFGHI',
        '123',
        '1234',
        'ABC4',
        '1BCD',
        'A2CD',
        'AB3D',
        ' ABC',
        'ABC ',
        'A BC',
        'AB C',
        'A C',
    ])('should throw: %s', (invalid: unknown) => {
        expect(() => StringValidator.validate(invalid, options)).toThrow();
        expect(() => validator.validate(invalid)).toThrow();
    });

    it.each([
        'ABC',
        'ABCD',
        'ABCDE',
        'ABCDEF',
        'ABCDEFG',
        'ABCXYZ',
    ])('should NOT throw: %s', (valid: unknown) => {
        StringValidator.validate(valid, options);
        validator.validate(valid);
    });
});
