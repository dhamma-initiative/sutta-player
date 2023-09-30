import { TrackSelection } from "./album-player-state.js";
export type ProcessedItem = (baseRef: string, idx: number, txtAudStatus: boolean[], cargo?: any) => void;
export interface SearchContext {
    albumIndex: number;
    searchFor: string;
    searchScope: number;
    useRegEx: boolean;
    regExFlags: string;
    applyAndBetweenTerms: boolean;
    ignoreDiacritics: boolean;
    maxMatchSurroundingChars: number;
    state: number;
}
export interface MatchedSearchRef {
    baseRef: string;
    idxPos: number;
    lineNum: number;
    totalLength: number;
    surroundingContext: string;
    cargo?: any;
}
export type MatchedSearchItem = (matchSearchRef: MatchedSearchRef, cargo?: any) => void;
export interface SearchControl {
    context: SearchContext;
    onStarted: () => void;
    onSearchingTrack: (baseRef: string, cargo?: any) => void;
    onMatched: MatchedSearchItem;
    onPaused: (paused: boolean, cargo?: any) => void;
    onAborted: () => void;
    onFinished: (cargo?: any) => void;
    start(): void;
    pause(paused: boolean): void;
    abort(): void;
}
export interface OfflineService {
    setConcurrency(count: number): number;
    startDownloads(baseRefs: string[], onDownloaded: ProcessedItem): Promise<void>;
    startDeletes(baseRefs: string[], onDeleted: ProcessedItem): Promise<void>;
    abortOfflineOperation(): void;
}
export interface CacheService {
    isInCache(baseRef: string, txt: boolean, aud: boolean): Promise<boolean[]>;
    addToCache(baseRef: string, txt: boolean, aud: boolean): Promise<boolean[]>;
    removeFromCache(baseRef: string, txt: boolean, aud: boolean): Promise<boolean[]>;
}
export interface QueryService {
    queryAlbumNames(): string[];
    queryAlbumReferences(): string[];
    queryTrackReferences(albIdx: number): Promise<string[]>;
    queryTrackBaseRef(albIdx: number, trackIdx: number): Promise<string>;
    queryTrackSelection(baseRef: string): Promise<TrackSelection>;
    queryTrackText(baseRef: string): Promise<string>;
    queryTrackTextUrl(baseRef: string): string;
    queryTrackHtmlAudioSrcRef(baseRef: string): string;
    readTextFile(url: string): Promise<string>;
}
export interface AlbumStorageQueryable extends QueryService, CacheService, OfflineService {
    queryAlbumCacheStatus(albIdx: number, onStatus: ProcessedItem): Promise<void>;
    createSearchControl(criteria: SearchContext): SearchControl;
    close(): void;
}
export declare class AlbumStorageQueryableFactory {
    static create(ctx: string): Promise<AlbumStorageQueryable>;
}
