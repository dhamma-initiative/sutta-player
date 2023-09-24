import { AlbumPlayerState } from "../models/album-player-state.js";
import { SuttaPlayerView } from "../views/sutta-player-view.js";
import { SuttaPlayerController } from "./sutta-player-controller.js";
export declare class FabController {
    private _model;
    private _view;
    private _mainCtrl;
    private _audDurPromise;
    constructor(mdl: AlbumPlayerState, vw: SuttaPlayerView, ctrl: SuttaPlayerController);
    setup(): Promise<void>;
    tearDown(): Promise<boolean>;
    notifyDuration(dur: number): void;
    private _registerListeners;
    private _registerAudioSeekListerners;
    private _registerStartStopBookmarkListeners;
    private _onSkipAudioToLine;
    private _managePromisedDuration;
}
