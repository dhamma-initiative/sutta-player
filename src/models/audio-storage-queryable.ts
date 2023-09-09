export interface AudioStorageQueryable {
    isInCache(trackRef: string): Promise<boolean>
    removeFromCache(trackRef: string): Promise<boolean>
    queryHtmlAudioSrcRef(trackRef: string): string
}

export class AudioStorageQueryableFactory {
    public static async create(ctx: string): Promise<AudioStorageQueryable> {
        const { createAudioQueryable } = await import(ctx)
        return await createAudioQueryable()
    }
}