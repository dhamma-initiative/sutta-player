import { AudioStorageQueryable } from '../audio-storage-queryable.js';
export declare function createAudioQueryable(): AudioStorageQueryable;
export declare class GoogleDriveAudioDB implements AudioStorageQueryable {
    static CACHE_NAME: string;
    static ORIGIN: string;
    static REST_API: string;
    constructor();
    isInCache(trackRef: string): Promise<boolean>;
    removeFromCache(trackRef: string): Promise<boolean>;
    queryHtmlAudioSrcRef(trackRef: string): string;
}
