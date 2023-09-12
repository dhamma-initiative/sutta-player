import { AlbumPlayerState } from "../models/album-player-state.js";
import { SuttaPlayerView } from "../views/sutta-player-view.js";
import { SuttaPlayerController } from "./sutta-player-controller.js";
export declare class ResetAppController {
    private _model;
    private _view;
    private _mainCtrl;
    private _resetApp;
    constructor(mdl: AlbumPlayerState, vw: SuttaPlayerView, ctrl: SuttaPlayerController);
    setup(): Promise<void>;
    tearDown(): Promise<boolean>;
    private _registerListeners;
    private _onResetAppConfirm;
}
