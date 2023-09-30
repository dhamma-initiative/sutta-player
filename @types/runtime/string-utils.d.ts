export declare class StringUtils {
    static DIACRITICS_CHR: string[];
    static DIACRITICS_ALT: string[];
    static allIndexesOf(src: string, srch: string, ignoreCase?: boolean): number[];
    static allIndexOfUsingRegEx(src: string, regEx: string, flags?: string): number[];
    static allLinePositions(src: string, allIndicies: number[]): number[];
    static surroundingTrim(src: string, pos: number, captureLen: number): string;
    static removeDiacritics(src: string): string;
}
