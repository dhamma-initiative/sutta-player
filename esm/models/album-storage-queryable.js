export class AlbumStorageQueryableFactory {
    static async create(ctx) {
        const { createAlbumStorageQueryable } = await import(ctx);
        return await createAlbumStorageQueryable();
    }
}
//# sourceMappingURL=album-storage-queryable.js.map