export class AudioStorageQueryableFactory {
    static async create(ctx) {
        const { createAudioQueryable } = await import(ctx);
        return createAudioQueryable();
    }
}
//# sourceMappingURL=audio-storage-queryable.js.map