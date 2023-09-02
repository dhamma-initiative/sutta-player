import { AudioStorageQueryable } from '../audio-storage-queryable.js';
export declare function createAudioQueryable(): AudioStorageQueryable;
export declare class GoogleDriveAudioDB implements AudioStorageQueryable {
    static CACHE_NAME: string;
    static ORIGIN: string;
    static REST_API: string;
    isInCache(suttaRef: string): Promise<boolean>;
    removeFromCache(suttaRef: string): Promise<boolean>;
    queryHtmlAudioSrcRef(suttaRef: string): string;
}
