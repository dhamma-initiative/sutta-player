import { TrackSelection } from "./album-player-state"

export interface AlbumStorageQueryable {
    queryAlbumNames(): string[]
    queryAlbumReferences(): string[]
    queryTrackReferences(albIdx: number): string[]
    queryTrackBaseRef(albIdx: number, trackIdx: number): string
    queryTrackSelection(baseRef: string): TrackSelection
    queryTrackText(baseRef: string): Promise<string>
    queryTrackTextUri(baseRef: string): string
    readTextFile(relPath: string): Promise<string>

    isInCache(baseRef: string): Promise<boolean>
    addToCache(baseRef: string): Promise<boolean>
    removeFromCache(baseRef: string): Promise<boolean>
}

export class AlbumStorageQueryableFactory {
    public static async create(ctx: string): Promise<AlbumStorageQueryable> {
        const { createAlbumStorageQueryable } = await import(ctx)
        return await createAlbumStorageQueryable()
    }
}