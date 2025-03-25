import {LabelOption, Validator} from './validator';

export interface ValidateArrayOptions extends LabelOption {
    minLength?: number;
    maxLength?: number;
    validate: Validator;
}

export class ArrayValidator extends Validator {
    constructor(private readonly options: ValidateArrayOptions) {
        super();
    }

    static validate(
        value: unknown,
        options: ValidateArrayOptions,
    ): void {
        this.addOptionalErrorLabel(options, () => {
            if (!Array.isArray(value)) {
                throw new Error(`array does not exists`);
            }
            if (options.minLength !== undefined && value.length < options.minLength) {
                throw new Error(`should have minimum ${options.minLength} characters`);
            }
            if (options.maxLength !== undefined && value.length > options.maxLength) {
                throw new Error(`should have maximum ${options.maxLength} characters`);
            }
            for (const item of value) {
                options.validate.validate(item);
            }
        });
    }

    validate(value: unknown): void {
        ArrayValidator.validate(value, this.options);
    }
}