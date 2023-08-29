import { SuttaStorageQueryable } from '../sutta-storage-queryable.js';
export declare function createSuttaStorageQueryable(): SuttaStorageQueryable;
export declare class JsonFsSuttaDB implements SuttaStorageQueryable {
    queryCollectionNames(): string[];
    queryCollectionReferences(): string[];
    querySuttaReferences(colIdx: number): string[];
    querySuttaBaseReference(colIdx: number, suttaIdx: number): string;
    querySuttaText(baseRef: string): Promise<string>;
    readTextFile(relPath: string): Promise<string>;
    protected _querySuttaReferences(colRef: string): string[];
}
