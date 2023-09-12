export interface AudioStorageQueryable {
    isInCache(baseRef: string): Promise<boolean>
    addToCache(baseRef: string): Promise<boolean>
    removeFromCache(baseRef: string): Promise<boolean>
    queryHtmlAudioSrcRef(baseRef: string): string
}

export class AudioStorageQueryableFactory {
    public static async create(ctx: string): Promise<AudioStorageQueryable> {
        const { createAudioQueryable } = await import(ctx)
        return await createAudioQueryable()
    }
}