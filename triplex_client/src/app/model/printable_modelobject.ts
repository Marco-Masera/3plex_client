export interface PrintableModelObject {
    toString(): string;
    toStringWithBold(substring: string): string[]
}