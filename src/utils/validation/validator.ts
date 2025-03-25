export interface LabelOption {
    label?: string;
}

export abstract class Validator {
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

    abstract validate(value: unknown): void;
}
