import {LabelOption, Validator} from "./validator";

export interface ValidateStringOptions extends LabelOption {
    minLength?: number;
    maxLength?: number;
    regExp?: RegExp;
}

export class StringValidator extends Validator {
    constructor(private readonly options: ValidateStringOptions) {
        super();
    }

    validate(value: unknown): void {
        StringValidator.validate(value, this.options);
    }

    static validate(
        value: unknown,
        options: ValidateStringOptions,
    ): void {
        this.addOptionalErrorLabel(options, () => {
            if (typeof (value) !== 'string') {
                throw new Error(`string does not exists`);
            }
            if (options.minLength !== undefined && value.length < options.minLength) {
                throw new Error(`should have minimum ${options.minLength} characters`);
            }
            if (options.maxLength !== undefined && value.length > options.maxLength) {
                throw new Error(`should have maximum ${options.maxLength} characters`);
            }
            if (options.regExp && !options.regExp.test(value)) {
                throw new Error(`${value} does not match the pattern ${options.regExp}`);
            }
        });
    }
}
