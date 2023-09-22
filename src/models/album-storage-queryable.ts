import { TrackSelection } from "./album-player-state.js"

export type ProcessedItem = (baseRef: string, idx: number, txtAudStatus: boolean[], cargo?: any) => void

export interface OfflineService {
    setConcurrency(count: number): number
    startDownloads(baseRefs: string[], onDownloaded: ProcessedItem): void
    startDeletes(baseRefs: string[], onDeleted: ProcessedItem): void
    abortOperation(): void
}

export interface CacheService {
    isInCache(baseRef: string, txt: boolean, aud: boolean): Promise<boolean[]>
    addToCache(baseRef: string, txt: boolean, aud: boolean): Promise<boolean[]>
    removeFromCache(baseRef: string, txt: boolean, aud: boolean): Promise<boolean[]>

    queryAlbumCacheStatus(albIdx: number, onChecked: ProcessedItem): void
}

export interface AlbumStorageQueryable extends CacheService, OfflineService {
    queryAlbumNames(): string[]
    queryAlbumReferences(): string[]
    queryTrackReferences(albIdx: number): string[]
    queryTrackBaseRef(albIdx: number, trackIdx: number): string
    queryTrackSelection(baseRef: string): TrackSelection
    queryTrackText(baseRef: string): Promise<string>
    queryTrackTextUrl(baseRef: string): string
    queryTrackHtmlAudioSrcRef(baseRef: string): string
    readTextFile(url: string): Promise<string>
}

export class AlbumStorageQueryableFactory {
    public static async create(ctx: string): Promise<AlbumStorageQueryable> {
        const { createAlbumStorageQueryable } = await import(ctx)
        return await createAlbumStorageQueryable()
    }
}