export declare class StringUtils {
    static allIndexesOf(src: string, srch: string, ignoreCase?: boolean): number[];
    static allIndexOfUsingRegEx(src: string, regEx: string): number[];
    static allLinePositions(src: string, allIndicies: number[]): number[];
    static surroundingTrim(src: string, pos: number, captureLen: number): string;
}
