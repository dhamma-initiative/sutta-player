import { SuttaPlayerState } from "../models/sutta-player-state.js";
import { SuttaPlayerView } from "../views/sutta-player-view.js";
import { SuttaPlayerController } from "./sutta-player-controller.js";
export declare class OfflineController {
    private _model;
    private _view;
    private _mainCtrl;
    private _downloadedPromise;
    constructor(mdl: SuttaPlayerState, vw: SuttaPlayerView, ctrl: SuttaPlayerController);
    setup(): Promise<void>;
    tearDown(): Promise<boolean>;
    onToggleDownload(): Promise<boolean>;
    onToggleDetele(): Promise<boolean>;
    private _registerListeners;
    private _prepareOfflineControls;
    private _onDownloadAlbum;
    private _onRemoveAlbum;
    private _onOfflineAlbumProcessing;
}
