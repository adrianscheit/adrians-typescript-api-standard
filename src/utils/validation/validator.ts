export interface LabelOption {
    label?: string;
}

export abstract class Validator {
    abstract validate(value: unknown): void;

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
