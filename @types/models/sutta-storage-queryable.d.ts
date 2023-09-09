import { TrackSelection } from "./sutta-player-state";
export interface SuttaStorageQueryable {
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
}
export declare class SuttaStorageQueryableFactory {
    static create(ctx: string): Promise<SuttaStorageQueryable>;
}
