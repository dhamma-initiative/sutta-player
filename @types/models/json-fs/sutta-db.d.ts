import { TrackSelection } from '../sutta-player-state.js';
import { SuttaStorageQueryable } from '../sutta-storage-queryable.js';
export declare function createSuttaStorageQueryable(): SuttaStorageQueryable;
export declare class JsonFsSuttaDB implements SuttaStorageQueryable {
    queryAlbumNames(): string[];
    queryAlbumReferences(): string[];
    queryTrackReferences(albIdx: number): string[];
    queryTrackBaseRef(albIdx: number, trackIdx: number): string;
    queryTrackSelection(baseRef: string): TrackSelection;
    queryTrackText(baseRef: string): Promise<string>;
    queryTrackTextUri(baseRef: string): string;
    readTextFile(relPath: string): Promise<string>;
    protected _queryTrackReferences(colRef: string): string[];
}
