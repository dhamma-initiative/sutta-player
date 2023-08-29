export interface AudioStorageQueryable {
    queryHtmlAudioSrcRef(suttaRef: string): string;
}
export declare class AudioStorageQueryableFactory {
    static create(ctx: string): Promise<AudioStorageQueryable>;
}
