import {ValidateArrayOptions, ValidateObjectOptions, Validation} from './validation';

describe('basic-validation', () => {
    describe('string', () => {
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
            expect(() => Validation.validateString(invalid, {
                minLength: 3,
                maxLength: 7,
                regExp: /^[A-Z]*$/
            })).toThrow();
        });

        it.each([
            'ABC',
            'ABCD',
            'ABCDE',
            'ABCDEF',
            'ABCDEFG',
        ])('should NOT throw: %s', (valid: string) => {
            Validation.validateString(valid, {minLength: 3, maxLength: 7, regExp: /^[A-Z]*$/});
        });
    });

    describe('number', () => {
        it.each([
            undefined as any as number,
            null as any as number,
            '' as any as number,
            -1,
            0,
            1,
            2.1,
            2.6,
            3.2,
            11,
            12,
            15,
            2846465862135,
        ])('should throw: %s', (invalid: number) => {
            expect(() => Validation.validateNumber(invalid, {min: 2, max: 10, step: 0.5})).toThrow();
        });

        it.each([
            2,
            3,
            4.5,
            6.5,
            8.5,
            10,
        ])('should NOT throw: %s', (valid: number) => {
            Validation.validateNumber(valid, {min: 2, max: 10, step: 0.5});
        });
    });

    describe('array', () => {
        const options: ValidateArrayOptions = {minLength: 3, maxLength: 4, validate: {number: {}}};


        it.each([
            [undefined],
            [null],
            [{}],
            [''],
            [0],
            [[]],
            [[0]],
            [[0, 0]],
            [[1, 2, 3, 4, 5]],
            // Invalid inner validation:
            [[1, '', 3]],
            [[1, 2, null]],
        ])('should throw: %s', (invalid: unknown) => {
            expect(() => Validation.validateArray(invalid, options)).toThrow();
        });

        it.each([
            [[1, 2, 3]],
            [[1, 2, 3, 4]],
        ])('should NOT throw: %s', (valid: number[]) => {
            Validation.validateArray(valid, options);
        });
    });

    describe('object', () => {
        const options: ValidateObjectOptions = {
            requiredKeys: {id: {number: {}}, name: {string: {}}},
            optionalKeys: {description: {string: {}}},
        };

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
            expect(() => Validation.validateObject(invalid, options)).toThrow();
        });

        it.each([
            {id: 123, name: 'Name'},
            {id: 123, name: 'Name', description: 'des'},
        ])('should NOT throw: %s', (valid: unknown) => {
            Validation.validateObject(valid, options);
        });
    });
});
