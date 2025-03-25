import {LabelOption, Validator} from './validator';

export interface ValidateDateStringOptions extends LabelOption {
    min?: string;
    max?: string;
}

export class ValidateDateStringOptionsCompiled {
    readonly min: number | undefined;
    readonly max: number | undefined;

    constructor(readonly options: ValidateDateStringOptions) {
        if (options.min) {
            this.min = DateStringValidator.convertDateStringToMs(options.min);
        }
        if (options.max) {
            this.max = DateStringValidator.convertDateStringToMs(options.max);
        }
    }
}

export class DateStringValidator extends Validator {
    readonly validateDateStringOptionsCompiled: ValidateDateStringOptionsCompiled =
        new ValidateDateStringOptionsCompiled(this.options);

    constructor(private readonly options: ValidateDateStringOptions) {
        super();
    }

    static validate(
        value: unknown,
        options: ValidateDateStringOptionsCompiled,
    ): void {
        this.addOptionalErrorLabel(options.options, () => {
            if (typeof (value) !== 'string') {
                throw new Error(`it should be string date`);
            }
            const date = DateStringValidator.convertDateStringToMs(value);
            if (options.min && date < options.min) {
                throw new Error(`The date cannot be earlier then ${options.options.min}`);
            }
            if (options.max && date > options.max) {
                throw new Error(`The date cannot be later then ${options.options.max}`);
            }
        });
    }

    static convertDateStringToMs(date: string): number {
        const ms = new Date(date).valueOf();
        if (isNaN(ms)) {
            throw new Error(`It is invalid date format: ${date}`);
        }
        return ms;
    }

    validate(value: unknown): void {
        DateStringValidator.validate(value, this.validateDateStringOptionsCompiled);
    }
}
