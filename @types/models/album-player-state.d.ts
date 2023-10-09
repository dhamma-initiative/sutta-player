import { LocalStorageState } from '../runtime/localstorage-state.js';
import { AlbumStorageQueryable, QueryService } from './album-storage-queryable.js';
export declare class TrackSelection extends LocalStorageState {
    context: string;
    albumIndex: number;
    trackIndex: number;
    baseRef: string;
    startTime: number;
    stopTime: number;
    lineRef: string;
    dictionary: any;
    isLoaded: boolean;
    constructor(ctx: string, albIdx?: number, trkIdx?: number, bRef?: string);
    read(src: TrackSelection): boolean;
    updateBaseRef(qry: QueryService): Promise<void>;
    isSimilar(toChk: TrackSelection): boolean;
    reset(ctx?: string, albIdx?: number, trkIdx?: number, bRef?: string): void;
    setDetails(lr?: string, st?: number, et?: number): void;
    protected _prepareSaveIntoJson(): any;
    save(): void;
    protected _prepareRestoreFromJson(json: any): void;
    restore(): void;
    private _refreshDictionary;
}
export declare class BookmarkedSelection extends TrackSelection {
    static CONTEXT: string;
    static ONLOAD: string;
    static AWAITING_AUDIO_END: string;
    static BUILD: string;
    appRoot: string;
    constructor(root?: string, ctx?: string, albIdx?: number, trkIdx?: number, bRef?: string);
    read(src: TrackSelection): boolean;
    reset(ctx?: string, albIdx?: number, trkIdx?: number, bRef?: string): void;
    setDetails(lr?: string, st?: number, et?: number): void;
    createLink(): string;
    parseLink(qry: AlbumStorageQueryable): Promise<void>;
    isAwaitingLoad(): boolean;
    isAwaitingAudioEnd(): boolean;
    cancelAwaitingAudioEndIfRqd(): void;
}
export interface PlaylistIterator {
    setContext(ctx: TrackSelection): Promise<void>;
    size(): number;
    hasPrev(): boolean;
    hasNext(): boolean;
    prev(): Promise<TrackSelection>;
    next(): Promise<TrackSelection>;
    current(): TrackSelection;
}
export interface PlayListItemJson {
    baseRef: string;
    lineRef: string;
    startTime: number;
    stopTime: number;
    notes: string;
}
export interface PlayListHeaderJson {
    id: string;
    name: string;
}
export interface PlayListJson {
    id: string;
    list: PlayListItemJson[];
}
export type PlaylistTuple = {
    header: PlayListHeaderJson;
    list: PlayListJson;
};
export declare class AlbumPlayerState extends LocalStorageState {
    catSel: TrackSelection;
    playlistSel: TrackSelection;
    homeSel: TrackSelection;
    playlists: PlayListHeaderJson[];
    currentPlaylist: PlayListJson;
    autoPlay: boolean;
    playNext: boolean;
    repeat: boolean;
    scrollTextWithAudio: boolean;
    loadAudioWithText: boolean;
    showLineNums: boolean;
    currentScrollY: number;
    currentTime: number;
    darkTheme: boolean;
    searchFor: string;
    searchScope: number;
    useRegEx: boolean;
    applyAndBetweenTerms: boolean;
    regExFlags: string;
    ignoreDiacritics: boolean;
    concurrencyCount: number;
    lastPlaylistIterator: string;
    playlistIterator: PlaylistIterator;
    stopDwnlDel: number;
    bookmarkSel: BookmarkedSelection;
    startSearch: boolean;
    private _audioState;
    onAudioStateChange: (oldVal: number, newVal: number) => void;
    constructor(bmSel: BookmarkedSelection);
    save(): void;
    restore(): void;
    setAudioState(val: number): void;
    getAudioState(): number;
    loadPlaylist(idx: number): PlaylistTuple;
    savePlaylist(plTuple: PlaylistTuple): void;
    static toLineRef(lineNum: number, begIdxPos: number, begPerc: number, endIdxPos?: number, endPerc?: number): string;
    static toLineRefUsingArr(refArr: number[]): string;
    static fromLineRef(lineRef: string): number[];
}
