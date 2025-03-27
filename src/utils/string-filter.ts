export class StringFilter {
    static normalize(value: string): string {
        return value
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase();
    }

    static processUserSearchInput(userSearchInput: string): string[] {
        return userSearchInput
            .trim()
            .split(/\s+/)
            .map((it) => this.normalize(it))
    }
}