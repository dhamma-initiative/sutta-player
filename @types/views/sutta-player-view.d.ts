import { AudioStorageQueryable } from '../models/audio-storage-queryable.js';
import { SuttaPlayerState, TrackSelection } from '../models/sutta-player-state.js';
import { SuttaStorageQueryable } from "../models/sutta-storage-queryable.js";
export declare class SuttaPlayerView {
    static LINEID_PREFIX: string;
    autoPlayElem: HTMLInputElement;
    playNextElem: HTMLInputElement;
    repeatElem: HTMLInputElement;
    linkTextToAudioElem: HTMLInputElement;
    showLineNumsElem: HTMLInputElement;
    darkThemeElem: HTMLInputElement;
    searchAllAlbumsElem: HTMLInputElement;
    useRegExElem: HTMLInputElement;
    ignoreDiacriticsElem: HTMLInputElement;
    offlineMenuElem: HTMLAnchorElement;
    resetAppMenuElem: HTMLAnchorElement;
    aboutMenuElem: HTMLAnchorElement;
    aboutDialogElem: HTMLDialogElement;
    aboutDialogCloseElem: HTMLAnchorElement;
    aboutTextBodyElem: HTMLParagraphElement;
    albumTrackSelectionElem: HTMLDetailsElement;
    albumElem: HTMLSelectElement;
    trackElem: HTMLSelectElement;
    loadAudioElem: HTMLButtonElement;
    loadTextElem: HTMLButtonElement;
    loadRandomElem: HTMLButtonElement;
    shareLinkElem: HTMLButtonElement;
    searchForElem: HTMLInputElement;
    searchSectionElem: HTMLDetailsElement;
    searchResultsElem: HTMLSelectElement;
    playingTrackElem: HTMLElement;
    linkNavToAudioElem: HTMLAnchorElement;
    audioPlayerElem: HTMLAudioElement;
    displayingTrackElem: HTMLElement;
    linkNavToTextElem: HTMLAnchorElement;
    trackTextBodyElem: HTMLDivElement;
    offlineDialogElem: HTMLDialogElement;
    offlineDialogCloseElem: HTMLAnchorElement;
    offlineTitleElem: HTMLElement;
    downloadAlbumElem: HTMLInputElement;
    deleteAlbumElem: HTMLInputElement;
    removeAudioFromCacheElem: HTMLButtonElement;
    processingInfoElem: HTMLDivElement;
    processingProgressElem: HTMLProgressElement;
    audioCacherElem: HTMLAudioElement;
    resetAppDialogElem: HTMLDialogElement;
    resetAppCloseElem: HTMLAnchorElement;
    resetAppConfirmElem: HTMLAnchorElement;
    snackbarElem: HTMLDivElement;
    scrollPlayToggleElem: HTMLInputElement;
    skipAudioToLineElem: HTMLAnchorElement;
    scrollTextWithAudioElem: HTMLInputElement;
    gotoTopElem: HTMLAnchorElement;
    private _modelState;
    private _suttaStore;
    private _audioStore;
    private _charPosLineIndex;
    constructor(mdl: SuttaPlayerState, store: SuttaStorageQueryable, audResolver: AudioStorageQueryable);
    initialise(cb: (event: MouseEvent) => void): Promise<void>;
    refreshAudioControls(): void;
    loadTracksList(): void;
    loadTrackText(lineSelCb: (event: MouseEvent) => void): Promise<void>;
    createLineRefValues(lineNum: number): string;
    setColorTheme(): void;
    scrollToTextLineNumber(lineNum: number, idxPos: number): void;
    scrollToTextPercCentred(perc: number): void;
    seekToTimePosition(charPos: number, charPerc: number, audDur: number): void;
    syncTextPositionWithAudio(): void;
    parseLineNumber(idRef: string): number;
    static createLineElementId(lineNum: number): string;
    loadTrackAudio(): void;
    loadSuttaAudioWith(trackSel: TrackSelection, audioElem: HTMLAudioElement): boolean;
    updatePlayingTrackInfo(baseRef: string, status: string): void;
    showMessage(msg: string, dur?: number): void;
    toggleLineNums(): void;
    toggleAboutInfo(event: any): Promise<void>;
    toggleOfflineDialog(event: any): void;
    toggleResetAppDialog(event: any): void;
    updateOfflineInfo(processingInfo: string, perc: number): void;
    refreshSkipAudioToLine(): void;
    private _loadAlbumsList;
    private _bindHtmlElements;
    private _bindSettingElements;
    private _bindNavigationElements;
    private _bindDisplayElements;
    private _bindOfflineElements;
    private _bindResetAppElements;
    private _bindAboutElements;
    private _bindMiscElements;
    private _getAudioPositionAsPerc;
    private _charPosToLineNumPercOffset;
}
