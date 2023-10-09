import { AlbumPlayerState } from "../models/album-player-state.js";
import { SuttaPlayerContainer, SuttaPlayerFabView } from "./sutta-player-container.js";
export declare class BaseController<V extends BaseView<BaseController<V>>> {
    model: AlbumPlayerState;
    view: V | null;
    container: SuttaPlayerContainer<SuttaPlayerFabView<any>>;
    constructor(mdl: AlbumPlayerState, cntr: SuttaPlayerContainer<any>);
    setup(): Promise<void>;
    tearDown(): Promise<void>;
    refresh(): Promise<void>;
    protected _createView(): Promise<void>;
    protected _registerListeners(): Promise<void>;
}
export declare class BaseView<C extends BaseController<BaseView<C>>> {
    controller: C | null;
    constructor(ctrl: C);
    bind(): Promise<void>;
    refresh(): Promise<void>;
}
