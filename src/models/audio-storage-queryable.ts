export interface AudioStorageQueryable {
    isInCache(suttaRef: string): Promise<boolean>
    removeFromCache(suttaRef: string): Promise<boolean>
    queryHtmlAudioSrcRef(suttaRef: string): string
}

export class AudioStorageQueryableFactory {
    public static async create(ctx: string): Promise<AudioStorageQueryable> {
        const { createAudioQueryable } = await import(ctx)
        return createAudioQueryable()
    }
}