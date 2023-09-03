import { AudioStorageQueryable } from '../models/audio-storage-queryable.js';
import { SuttaPlayerState, SuttaSelection } from '../models/sutta-player-state.js';
import { SuttaStorageQueryable } from "../models/sutta-storage-queryable.js";
export declare class SuttaPlayerView {
    autoPlayElem: HTMLInputElement;
    playNextElem: HTMLInputElement;
    repeatElem: HTMLInputElement;
    linkTextToAudioElem: HTMLInputElement;
    offlineMenuElem: HTMLAnchorElement;
    resetAppMenuElem: HTMLAnchorElement;
    aboutMenuElem: HTMLAnchorElement;
    aboutDialogElem: HTMLDialogElement;
    aboutDialogCloseElem: HTMLAnchorElement;
    aboutTextBodyElem: HTMLParagraphElement;
    collectionElem: HTMLSelectElement;
    suttaElem: HTMLSelectElement;
    loadAudioElem: HTMLButtonElement;
    loadTextElem: HTMLButtonElement;
    loadRandomElem: HTMLButtonElement;
    playingSuttaElem: HTMLElement;
    audioPlayerElem: HTMLAudioElement;
    displayingSuttaElem: HTMLElement;
    suttaTextBodyElem: HTMLDivElement;
    offlineDialogElem: HTMLDialogElement;
    offlineDialogCloseElem: HTMLAnchorElement;
    offlineTitleElem: HTMLElement;
    downloadAlbumElem: HTMLInputElement;
    deleteAlbumElem: HTMLInputElement;
    stopProcessingElem: HTMLInputElement;
    processingInfoElem: HTMLDivElement;
    processingProgressElem: HTMLProgressElement;
    audioCacherElem: HTMLAudioElement;
    resetAppDialogElem: HTMLDialogElement;
    resetAppCloseElem: HTMLAnchorElement;
    resetAppConfirmElem: HTMLAnchorElement;
    private _modelState;
    private _suttaStore;
    private _audioStore;
    constructor(mdl: SuttaPlayerState, store: SuttaStorageQueryable, audResolver: AudioStorageQueryable);
    initialise(): Promise<void>;
    refreshAudioControls(): void;
    loadSuttasList(): void;
    loadSuttaText(): Promise<void>;
    loadSuttaAudio(): void;
    loadSuttaAudioWith(suttaSel: SuttaSelection, viewAudio: HTMLAudioElement): boolean;
    updatePlayingSuttaInfo(baseRef: string, status: string): void;
    toggleAboutInfo(event: any): Promise<void>;
    toggleOfflineDialog(event: any): void;
    toggleResetAppDialog(event: any): void;
    updateOfflineInfo(processingInfo: string, perc: number): void;
    private _loadCollectionsList;
    private _bindHtmlElements;
}
