import { LocalStorageState } from '../runtime/localstorage-state.js';
import { AlbumStorageQueryable } from './album-storage-queryable.js';
export declare class TrackSelection extends LocalStorageState {
    context: string;
    albumIndex: number;
    trackIndex: number;
    baseRef: string;
    dictionary: any;
    isLoaded: boolean;
    constructor(ctx: string, albIdx?: number, trkIdx?: number, bRef?: string);
    read(src: TrackSelection): boolean;
    updateBaseRef(qry: AlbumStorageQueryable): void;
    isSimilar(toChk: TrackSelection): boolean;
    reset(ctx?: string, albIdx?: number, trkIdx?: number, bRef?: string): void;
    save(): void;
    restore(): void;
    private _refreshDictionary;
}
export declare class BookmarkedSelection extends TrackSelection {
    static CONTEXT: string;
    static ONLOAD: string;
    static AWAITING_AUDIO_END: string;
    static BUILD: string;
    appRoot: string;
    startTime: number;
    endTime: number;
    lineRef: string;
    constructor(root?: string, ctx?: string, albIdx?: number, trkIdx?: number, bRef?: string);
    read(src: TrackSelection): boolean;
    reset(ctx?: string, albIdx?: number, trkIdx?: number, bRef?: string): void;
    set(st?: number, et?: number, lr?: string): void;
    createLink(): string;
    parseLink(qry: AlbumStorageQueryable): void;
    isAwaitingLoad(): boolean;
    isAwaitingAudioEnd(): boolean;
    cancelAwaitingAudioEndIfRqd(): void;
}
export declare class AlbumPlayerState extends LocalStorageState {
    navSel: TrackSelection;
    textSel: TrackSelection;
    audioSel: TrackSelection;
    autoPlay: boolean;
    playNext: boolean;
    repeat: boolean;
    linkTextToAudio: boolean;
    showLineNums: boolean;
    currentScrollY: number;
    currentTime: number;
    darkTheme: boolean;
    showContextControls: boolean;
    searchFor: string;
    searchScope: number;
    useRegEx: boolean;
    ignoreDiacritics: boolean;
    audioState: number;
    stopDwnlDel: number;
    bookmarkSel: BookmarkedSelection;
    startSearch: boolean;
    scrollTextWithAudio: boolean;
    constructor(bmSel: BookmarkedSelection);
    save(): void;
    restore(): void;
    static toLineRef(lineNum: number, begIdxPos: number, begPerc: number, endIdxPos: number, endPerc: number): string;
    static toLineRefUsingArr(refArr: number[]): string;
    static fromLineRef(lineRef: string): number[];
}
