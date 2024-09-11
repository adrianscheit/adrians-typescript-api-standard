import { BasicValidation } from "./basic-validation";

describe('basic-validation', () => {
    describe('string', () => {
        it.each([
            undefined as any as string,
            null as any as string,
            4 as any as string,
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
        ])('should throw: %s', (invalid: string) => {
            expect(() => BasicValidation.validateString(invalid, { minLength: 3, maxLength: 7, regExp: /^[A-Z]*$/ })).toThrow();
        });

        it.each([
            'ABC',
            'ABCD',
            'ABCDE',
            'ABCDEF',
            'ABCDEFG',
        ])('should NOT throw: %s', (valid: string) => {
            BasicValidation.validateString(valid, { minLength: 3, maxLength: 7, regExp: /^[A-Z]*$/ });
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
            expect(() => BasicValidation.validateNumber(invalid, { min: 2, max: 10, step: 0.5 })).toThrow();
        });

        it.each([
            2,
            3,
            4.5,
            6.5,
            8.5,
            10,
        ])('should NOT throw: %s', (valid: number) => {
            BasicValidation.validateNumber(valid, { min: 2, max: 10, step: 0.5 });
        });
    });

    describe('array', () => {
        it.each([
            [undefined as any as number[]],
            [null as any as number[]],
            [{} as any as number[]],
            ['' as any as number[]],
            [0 as any as number[]],
            [[]],
            [[0]],
            [[0, 0]],
            [[1, 2, 3, 4, 5]],
        ])('should throw: %s', (invalid: number[]) => {
            expect(() => BasicValidation.validateArray(invalid, { minLength: 3, maxLength: 4 })).toThrow();
        });

        it.each([
            [[1, 2, 3]],
            [[1, 2, 3, 4]],
        ])('should NOT throw: %s', (valid: number[]) => {
            BasicValidation.validateArray(valid, { minLength: 3, maxLength: 4 });
        });
    });

    describe('object', () => {
        it.each([
            undefined as any as Object,
            null as any as Object,
            [] as any as Object,
            '' as any as Object,
            0 as any as Object,
        ])('should throw: %s', (invalid: Object) => {
            expect(() => BasicValidation.validateObject(invalid, { requiredKeys: new Set(['id', 'name']), optionalKeys: new Set(['description']) })).toThrow();
        });

        it.each([
            { id: 123, name: 'Name' },
            { id: 123, name: 'Name', description: 'des' },
        ])('should NOT throw: %s', (valid: Object) => {
            BasicValidation.validateObject(valid, { requiredKeys: new Set(['id', 'name']), optionalKeys: new Set(['description']) })
        });
    });
});
