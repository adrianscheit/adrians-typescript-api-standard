export interface LabelOption {
    label?: string;
}

export interface ValidateStringOptions extends LabelOption {
    minLength?: number;
    maxLength?: number;
    regExp?: RegExp;
}

export interface ValidateNumberOptions extends LabelOption {
    min?: number;
    max?: number;
    step?: number;
}

export interface ValidateArrayOptions extends LabelOption {
    minLength?: number;
    maxLength?: number;
    validate: ValidationDefinition;
}

export interface ValidateObjectOptions extends LabelOption {
    requiredKeys?: { [key: string]: ValidationDefinition };
    optionalKeys?: { [key: string]: ValidationDefinition };
}

export type ValidationDefinition =
    { string: ValidateStringOptions } |
    { number: ValidateNumberOptions } |
    { array: ValidateArrayOptions } |
    { object: ValidateObjectOptions };

export class Validation {
    static readonly validationrsMap: { [key: string]: (value: unknown, options: any) => void } = {
        string: this.validateString,
        number: this.validateNumber,
        array: this.validateArray,
        object: this.validateObject,
    };

    static validate(value: unknown, validationDefinition: ValidationDefinition): void {
        const [key, options] = Object.entries(validationDefinition)[0];
        this.validationrsMap[key].bind(this)(value, options);
    }

    static validateString(
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

    static validateNumber(
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

    static validateArray(
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
                this.validate(item, options.validate);
            }
        });
    }

    static validateObject<T>(
        value: unknown,
        options: ValidateObjectOptions,
    ): void {
        this.addOptionalErrorLabel(options, () => {
            if (typeof value !== 'object') {
                throw new Error(`this is not an object`);
            }
            if (Array.isArray(value)) {
                throw new Error(`its an array`);
            }
            const keys = new Set<string>(Object.keys(value!) as any[]);

            if (options.requiredKeys !== undefined) {
                for (const key of Object.keys(options.requiredKeys)) {
                    if (!keys.has(key)) {
                        throw new Error(`it does not contains required key ${String(key)}`);
                    }
                }
            }
            for (const key of keys) {
                const validationDefinition: ValidationDefinition | undefined = options.requiredKeys?.[key] || options.optionalKeys?.[key];
                if (!validationDefinition) {
                    throw new Error(`it contains keys that should not be there ${String(key)}`);
                }
                this.validate((value as any)[key], validationDefinition);
            }
        });
    }

    static addOptionalErrorLabel(options: LabelOption, coveredIfLabel: () => void): void {
        if (options.label) {
            try {
                coveredIfLabel();
            } catch (err) {
                throw new Error(`${options.label}: ${(err as Error).message}`);
            }
        } else {
            coveredIfLabel();
        }
    }
}
