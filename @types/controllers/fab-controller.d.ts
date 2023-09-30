import { AlbumPlayerState } from "../models/album-player-state.js";
import { SuttaPlayerView } from "../views/sutta-player-view.js";
import { SuttaPlayerController } from "./sutta-player-controller.js";
export declare class FabController {
    private _model;
    private _view;
    private _mainCtrl;
    constructor(mdl: AlbumPlayerState, vw: SuttaPlayerView, ctrl: SuttaPlayerController);
    setup(): Promise<void>;
    tearDown(): Promise<boolean>;
    private _registerListeners;
    private _registerNavigationListeners;
    private _registerAudioSeekListerners;
    private _registerStartStopBookmarkListeners;
    private _registerMaxAudioElemResizeListener;
    private _registerAudioStateChangeListener;
    private _onSkipAudioToLine;
    private _managePromisedDuration;
}
