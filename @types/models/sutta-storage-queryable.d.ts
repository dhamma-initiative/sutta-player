export interface SuttaStorageQueryable {
    queryCollectionNames(): string[];
    queryCollectionReferences(): string[];
    querySuttaReferences(colIdx: number): string[];
    querySuttaBaseReference(colIdx: number, suttaIdx: number): string;
    querySuttaText(baseRef: string): Promise<string>;
    querySuttaTextUri(baseRef: string): string;
    readTextFile(relPath: string): Promise<string>;
}
export declare class SuttaStorageQueryableFactory {
    static create(ctx: string): Promise<SuttaStorageQueryable>;
}
