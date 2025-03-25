import {ArrayValidator, ValidateArrayOptions} from './array-validator';
import {NumberValidator} from './number-validator';

describe('array', () => {
    const options: ValidateArrayOptions = {minLength: 3, maxLength: 4, validate: new NumberValidator({})};
    const validator = new ArrayValidator(options);

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
        [[{}, 2, 3]],
        [[1, '', 3]],
        [[1, 2, null]],
        [[1, 2, 3, [4]]],
    ])('should throw: %s', (invalid: unknown) => {
        expect(() => ArrayValidator.validate(invalid, options)).toThrow();
        expect(() => validator.validate(invalid)).toThrow();
    });

    it.each([
        [[1, 2, 3]],
        [[1, 2, 3, 4]],
    ])('should NOT throw: %s', (valid: number[]) => {
        ArrayValidator.validate(valid, options);
        validator.validate(valid);
    });
});
