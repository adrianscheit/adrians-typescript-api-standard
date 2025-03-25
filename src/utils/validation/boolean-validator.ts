import {LabelOption, Validator} from './validator';

export interface ValidateBooleanOptions extends LabelOption {
}

export class BooleanValidator extends Validator {
    constructor(private readonly options: ValidateBooleanOptions) {
        super();
    }

    static validate(
        value: unknown,
        options: ValidateBooleanOptions,
    ): void {
        this.addOptionalErrorLabel(options, () => {
            if (value !== true && value!== false){
                throw new Error('it is not boolean');
            }
        });
    }

    validate(value: unknown): void {
        BooleanValidator.validate(value, this.options);
    }
}
