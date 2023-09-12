export interface AudioStorageQueryable {
    isInCache(baseRef: string): Promise<boolean>;
    addToCache(baseRef: string): Promise<boolean>;
    removeFromCache(baseRef: string): Promise<boolean>;
    queryHtmlAudioSrcRef(baseRef: string): string;
}
export declare class AudioStorageQueryableFactory {
    static create(ctx: string): Promise<AudioStorageQueryable>;
}
