export interface AudioStorageQueryable {
    isInCache(trackRef: string): Promise<boolean>;
    removeFromCache(trackRef: string): Promise<boolean>;
    queryHtmlAudioSrcRef(trackRef: string): string;
}
export declare class AudioStorageQueryableFactory {
    static create(ctx: string): Promise<AudioStorageQueryable>;
}
