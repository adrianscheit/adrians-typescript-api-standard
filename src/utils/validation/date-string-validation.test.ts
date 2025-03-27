import {
    DateStringValidator,
    ValidateDateStringOptions,
    ValidateDateStringOptionsCompiled
} from "./date-string-validator";

describe('date-string', () => {
    const options: ValidateDateStringOptions = {
        min: '2025-03-25T15:14:16.114Z',
        max: '2025-03-26',
    };
    const compiledOptions = new ValidateDateStringOptionsCompiled(options);
    const validator = new DateStringValidator(options);

    it.each([
        undefined,
        null,
        0,
        1,
        Date.now(),
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
        'AB3D',
        ' ABC',
        'ABC ',
        'A BC',
        'AB C',
        'A C',
        '2025',
        '2025-03',
        '2024-03-25',
        '2025-02-25',
        '2025-03-25',
        '2025-03-25T15:14:16.113Z',
        '2025-03-26T00:00:00.001Z',
        '2025-03-27',
        '2025-04-26',
        '2026-03-26',
    ])('should throw: %s', (invalid: unknown) => {
        expect(() => DateStringValidator.validate(invalid, compiledOptions)).toThrow();
        expect(() => validator.validate(invalid)).toThrow();
    });

    it.each([
        '2025-03-25T15:14:16.114Z',
        '2025-03-25T23:59:59.999Z',
        '2025-03-26',
        '2025-03-26T00:00:00.000Z',
    ])('should NOT throw: %s', (valid: unknown) => {
        DateStringValidator.validate(valid, compiledOptions);
        validator.validate(valid);
    });

    it('convert ms time to unix time', () => {
        expect(DateStringValidator.convertMsToUnixTime(
            DateStringValidator.convertDateStringToMs('1970-01-01T00:00:00Z') + DateStringValidator.weekInMs
        )).toBe(DateStringValidator.weekInMs / 1000);
    });
});
