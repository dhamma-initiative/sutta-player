import { SuttaPlayerState } from "../models/sutta-player-state.js";
import { SuttaPlayerView } from "../views/sutta-player-view.js";
import { SuttaPlayerController } from "./sutta-player-controller.js";
export declare class AboutController {
    private _model;
    private _view;
    private _mainCtrl;
    constructor(mdl: SuttaPlayerState, vw: SuttaPlayerView, ctrl: SuttaPlayerController);
    setup(): Promise<void>;
    tearDown(): Promise<boolean>;
    private _registerListeners;
}
