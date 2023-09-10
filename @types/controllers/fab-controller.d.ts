import { SuttaPlayerState } from "../models/sutta-player-state.js";
import { SuttaPlayerView } from "../views/sutta-player-view.js";
import { SuttaPlayerController } from "./sutta-player-controller.js";
export declare class FabController {
    private _model;
    private _view;
    private _mainCtrl;
    private _audDurPromise;
    constructor(mdl: SuttaPlayerState, vw: SuttaPlayerView, ctrl: SuttaPlayerController);
    setup(): Promise<void>;
    tearDown(): Promise<boolean>;
    notifyDuration(dur: number): void;
    private _registerListeners;
    private _onSkipAudioToLine;
    private _managePromisedDuration;
}
