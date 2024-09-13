export class BasicValidation {
    static validateString(
        value: string,
        options: {
            label?: string;
            minLength?: number;
            maxLength?: number;
            regExp?: RegExp;
        } = {},
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

    static validateNumber(value: number,
        options: {
            label?: string;
            min?: number;
            max?: number;
            step?: number;
        } = {},
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

    static validateArray(value: unknown[],
        options: {
            label?: string;
            minLength?: number;
            maxLength?: number;
        } = {},
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
        });
    }

    static validateObject<T>(value: T,
        options: {
            label?: string;
            requiredKeys?: ReadonlySet<keyof T>;
            optionalKeys?: ReadonlySet<keyof T>;
        } = {},
    ): void {
        this.addOptionalErrorLabel(options, () => {
            if (typeof value !== 'object') {
                throw new Error(`this is not an object`);
            }
            if (Array.isArray(value)) {
                throw new Error(`its an array`);
            }
            const keys = new Set<keyof T>(Object.keys(value!) as any[]);
            if (options.requiredKeys !== undefined) {
                for (const key of options.requiredKeys) {
                    if (!keys.has(key)) {
                        throw new Error(`it does not contains required key ${String(key)}`);
                    }
                }
            }
            if (options.optionalKeys !== undefined) {
                for (const key of keys) {
                    if (!options.requiredKeys?.has(key) && !options.optionalKeys.has(key)) {
                        throw new Error(`it contains keys that should not be there ${String(key)}`);
                    }
                }
            }
        });
    }

    static addOptionalErrorLabel(options: { label?: string }, coveredIfLabel: () => void): void {
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
