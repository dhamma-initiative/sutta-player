import { AudioStorageQueryable } from '../audio-storage-queryable.js';
export declare function createAudioQueryable(): Promise<AudioStorageQueryable>;
export declare class GoogleDriveAudioStorageDB implements AudioStorageQueryable {
    static CACHE_NAME: string;
    static ORIGIN: string;
    static REST_API: string;
    setup(): Promise<void>;
    private _registerRoutesWithServiceWorker;
    isInCache(baseRef: string): Promise<boolean>;
    addToCache(baseRef: string): Promise<boolean>;
    removeFromCache(baseRef: string): Promise<boolean>;
    queryHtmlAudioSrcRef(baseRef: string): string;
}
