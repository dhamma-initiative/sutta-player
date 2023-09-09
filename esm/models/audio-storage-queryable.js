export class AudioStorageQueryableFactory {
    static async create(ctx) {
        const { createAudioQueryable } = await import(ctx);
        return await createAudioQueryable();
    }
}
//# sourceMappingURL=audio-storage-queryable.js.map