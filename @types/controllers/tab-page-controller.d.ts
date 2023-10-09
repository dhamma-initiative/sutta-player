import { AlbumPlayerState } from "../models/album-player-state.js";
import { BaseController, BaseView } from "./base-controller.js";
import { SuttaPlayerContainer } from "./sutta-player-container.js";
export declare class TabPageController<V extends TabPageView<TabPageController<V>>> extends BaseController<V> {
    constructor(mdl: AlbumPlayerState, cntr: SuttaPlayerContainer<any>);
    getElementId(): string;
    getCtxMenuElementId(): string;
    getIndex(): number;
    onEnter(): void;
    onExit(): void;
    protected _toggleViewElements(styleDisp: string): void;
}
export declare class TabPageView<C extends TabPageController<TabPageView<C>>> extends BaseView<C> {
}
