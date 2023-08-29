export class SuttaStorageQueryableFactory {
    static async create(ctx) {
        const { createSuttaStorageQueryable } = await import(ctx);
        return createSuttaStorageQueryable();
    }
}
//# sourceMappingURL=sutta-storage-queryable.js.map