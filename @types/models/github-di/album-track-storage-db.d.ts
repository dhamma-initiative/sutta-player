import { AlbumStorageQueryable, ProcessedItem, SearchContext, SearchControl } from '../album-storage-queryable.js';
import { InternalQueryCacheStore } from './internal-query-cache-store.js';
export declare function createAlbumStorageQueryable(): Promise<AlbumStorageQueryable>;
export declare class GithubDiSuttaStorageDB extends InternalQueryCacheStore implements AlbumStorageQueryable {
    static SINGLETON: GithubDiSuttaStorageDB;
    private _noOfWorkers;
    private _abortCachingOperation;
    private _downloadScheduler;
    private _albumCacheStatusQuerier;
    setup(): Promise<void>;
    queryAlbumCacheStatus(albIdx: number, onStatus: ProcessedItem): Promise<void>;
    setConcurrency(count: number): number;
    startDownloads(baseRefs: string[], onDownloaded: ProcessedItem): Promise<void>;
    startDeletes(baseRefs: string[], onDeleted: ProcessedItem): Promise<void>;
    abortOfflineOperation(): void;
    createSearchControl(criteria: SearchContext): SearchControl;
    close(): void;
}
