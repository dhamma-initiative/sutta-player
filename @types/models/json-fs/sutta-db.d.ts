import { TrackSelection } from '../sutta-player-state.js';
import { SuttaStorageQueryable } from '../sutta-storage-queryable.js';
export declare function createSuttaStorageQueryable(): Promise<SuttaStorageQueryable>;
export declare class JsonFsSuttaDB implements SuttaStorageQueryable {
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
    isInCache(trackTxtUri: string): Promise<boolean>;
    removeFromCache(trackTxtUri: string): Promise<boolean>;
    protected _queryTrackReferences(colRef: string): string[];
}
