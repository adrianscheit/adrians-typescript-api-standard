import {StringValidator, ValidateStringOptions} from "./string-validator";

describe('string', () => {
    const options: ValidateStringOptions = {
        minLength: 3,
        maxLength: 7,
        regExp: /^[A-Z]*$/
    };
    const validator = new StringValidator(options);

    it.each([
        undefined as any as string,
        null as any as string,
        4 as any as string,
        {} as any as string,
        {AAA: 'AAA'} as any as string,
        [] as any as string,
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
    ])('should throw: %s', (invalid: string) => {
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
    ])('should NOT throw: %s', (valid: string) => {
        StringValidator.validate(valid, options);
        validator.validate(valid);
    });
});
