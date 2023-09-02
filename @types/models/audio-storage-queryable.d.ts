export interface AudioStorageQueryable {
    isInCache(suttaRef: string): Promise<boolean>;
    removeFromCache(suttaRef: string): Promise<boolean>;
    queryHtmlAudioSrcRef(suttaRef: string): string;
}
export declare class AudioStorageQueryableFactory {
    static create(ctx: string): Promise<AudioStorageQueryable>;
}
