import { TrackSelection } from '../album-player-state.js';
import { AlbumStorageQueryable } from '../album-storage-queryable.js';
export declare function createAlbumStorageQueryable(): Promise<AlbumStorageQueryable>;
export declare class JsonFsAlbumStorageDB implements AlbumStorageQueryable {
    static CACHE_NAME: string;
    setup(): Promise<void>;
    queryAlbumNames(): string[];
    queryAlbumReferences(): string[];
    queryTrackReferences(albIdx: number): string[];
    queryTrackBaseRef(albIdx: number, trackIdx: number): string;
    queryTrackSelection(baseRef: string): TrackSelection;
    queryTrackText(baseRef: string): Promise<string>;
    queryTrackTextUri(baseRef: string): string;
    readTextFile(relPath: string): Promise<string>;
    isInCache(baseRef: string): Promise<boolean>;
    addToCache(baseRef: string): Promise<boolean>;
    removeFromCache(baseRef: string): Promise<boolean>;
    protected _queryTrackReferences(colRef: string): string[];
}
