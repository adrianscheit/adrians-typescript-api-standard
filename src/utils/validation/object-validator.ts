import {LabelOption, Validator} from './validator';

export interface ValidateObjectOptions extends LabelOption {
    requiredKeys?: { [key: string]: Validator };
    optionalKeys?: { [key: string]: Validator };
    failOnUnknownKey?: boolean;
}

export class ObjectValidator extends Validator {
    constructor(private readonly options: ValidateObjectOptions) {
        super();
    }

    static validate(
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
                const validationDefinition: Validator | undefined = options.requiredKeys?.[key] || options.optionalKeys?.[key];
                if (!validationDefinition) {
                    if (options.failOnUnknownKey) {
                        throw new Error(`it contains keys that should not be there ${String(key)}`);
                    }
                } else {
                    validationDefinition.validate((value as any)[key]);
                }
            }
        });
    }

    validate(value: unknown): void {
        ObjectValidator.validate(value, this.options);
    }
}