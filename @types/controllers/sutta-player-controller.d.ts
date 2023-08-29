import { AudioStorageQueryable } from '../models/audio-storage-queryable.js';
import { SuttaStorageQueryable } from "../models/sutta-storage-queryable.js";
export declare class SuttaPlayerController {
    private _audioStorage;
    private _suttaStorage;
    private _view;
    private _model;
    constructor(suttaStorage: SuttaStorageQueryable, audioStorage: AudioStorageQueryable);
    setup(): Promise<void>;
    tearDown(): Promise<void>;
    private _registerListeners;
    private _onAudioEnded;
    private _onCollectionSelected;
    private _onSuttaSelected;
    private _onLoadAudio;
    private _onLoadText;
}
