import {LabelOption, Validator} from './validator';

export interface ValidateNumberOptions extends LabelOption {
    min?: number;
    max?: number;
    step?: number;
}

export class NumberValidator extends Validator {
    constructor(private readonly options: ValidateNumberOptions) {
        super();
    }

    static validate(
        value: unknown,
        options: ValidateNumberOptions,
    ): void {
        this.addOptionalErrorLabel(options, () => {
            if (typeof (value) !== 'number') {
                throw new Error(`number does not exists`);
            }
            if (options.min !== undefined && value < options.min) {
                throw new Error(`should be minimum ${options.min}`);
            }
            if (options.max !== undefined && value > options.max) {
                throw new Error(`should be maximum ${options.max}`);
            }
            if (options.step && value % options.step !== 0) {
                throw new Error(`has a wrong step ${options.step}`);
            }
        });
    }

    validate(value: unknown): void {
        NumberValidator.validate(value, this.options);
    }
}
