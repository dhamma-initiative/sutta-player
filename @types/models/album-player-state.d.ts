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
    read(src: TrackSelection): void;
    updateBaseRef(qry: AlbumStorageQueryable): void;
    isSimilar(toChk: TrackSelection): boolean;
    save(): void;
    restore(): void;
}
export declare class AlbumPlayerState extends LocalStorageState {
    navSel: TrackSelection;
    textSel: TrackSelection;
    audioSel: TrackSelection;
    downloadedAlbums: number[];
    autoPlay: boolean;
    playNext: boolean;
    repeat: boolean;
    linkTextToAudio: boolean;
    showLineNums: boolean;
    currentScrollY: number;
    currentTime: number;
    darkTheme: boolean;
    searchFor: string;
    searchAlbums: number;
    useRegEx: boolean;
    ignoreDiacritics: boolean;
    audioState: number;
    stopDwnlDel: number;
    bookmarkLineRef: string;
    startSearch: boolean;
    scrollTextWithAudio: boolean;
    save(): void;
    restore(): void;
    isAlbumDownloaded(albumIndex: number): boolean;
    static toLineRef(lineNum: number, begIdxPos: number, begPerc: number, endIdxPos: number, endPerc: number): string;
    static toLineRefUsingArr(refArr: number[]): string;
    static fromLineRef(lineRef: string): number[];
}
