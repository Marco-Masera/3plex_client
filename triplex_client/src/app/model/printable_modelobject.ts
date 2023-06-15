export interface PrintableModelObject {
    toString(): string;
    toStringWithBold(substring: string): string[]
    get_help_tooltip(): string
}