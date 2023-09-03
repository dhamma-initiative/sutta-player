import { AudioStorageQueryable } from '../models/audio-storage-queryable.js';
import { SuttaStorageQueryable } from "../models/sutta-storage-queryable.js";
export declare class SuttaPlayerController {
    private _audioStore;
    private _suttaStore;
    private _appRoot;
    private _view;
    private _model;
    private _downloadedPromise;
    constructor(appRoot: string, suttaStorage: SuttaStorageQueryable, audioStorage: AudioStorageQueryable);
    setup(): Promise<void>;
    tearDown(): Promise<void>;
    private _registerListeners;
    private _onAudioEnded;
    private _onAlbumSelected;
    private _onSuttaSelected;
    private _onLoadAudio;
    private _onLoadText;
    private _onLoadRandom;
    private _onDownloadAlbum;
    private _onRemoveAlbum;
    private _onOfflineAlbumProcessing;
    private _onResetAppConfirm;
    private _onShareLink;
    private _onLoadIntoNavSelector;
    private _loadShareLinkIfSpecified;
}
