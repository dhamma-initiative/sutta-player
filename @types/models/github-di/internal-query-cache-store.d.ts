import { TrackSelection } from "../album-player-state.js";
import { CacheService, QueryService } from "../album-storage-queryable.js";
interface RootDbJson {
    albumName: string[];
    albumBaseDirectory: string[];
}
export declare class InternalQueryCacheStore implements QueryService, CacheService {
    protected _rootDbJson: RootDbJson;
    protected _lastTrackReferencesRqstKey: string;
    protected _lastTrackReferencesRqstVal: string[];
    protected _lastTrackReferencesRqstTimeoutHandle: ReturnType<typeof setTimeout>;
    queryAlbumNames(): string[];
    queryAlbumReferences(): string[];
    queryTrackReferences(albIdx: number): Promise<string[]>;
    queryTrackBaseRef(albIdx: number, trackIdx: number): Promise<string>;
    queryTrackSelection(baseRef: string): Promise<TrackSelection>;
    queryTrackText(baseRef: string): Promise<string>;
    queryTrackTextUrl(baseRef: string): string;
    queryTrackHtmlAudioSrcRef(baseRef: string): string;
    readTextFile(url: string): Promise<string>;
    isInCache(baseRef: string, txt: boolean, aud: boolean): Promise<boolean[]>;
    addToCache(baseRef: string, txt: boolean, aud: boolean): Promise<boolean[]>;
    removeFromCache(baseRef: string, txt: boolean, aud: boolean): Promise<boolean[]>;
    protected _prepareBaseRefAsUrls(baseRef: string, txt: boolean, aud: boolean): string[];
    protected _queryTrackReferences(colRef: string): Promise<string[]>;
    protected _startInMemoryTrackReferencesClearanceTime(): void;
}
export {};
