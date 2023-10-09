import { PlaylistIterator, TrackSelection } from "../models/album-player-state.js";
import { TabPageController, TabPageView } from "./tab-page-controller.js";
export declare class CatalogTabPageController<V extends CatalogTabPageView<any>> extends TabPageController<V> {
    private _catalogPlaylistIterator;
    setup(): Promise<void>;
    revealTrack(srcSel: TrackSelection): Promise<void>;
    protected _createView(): Promise<void>;
    protected _registerListeners(): Promise<void>;
    private _onAlbumSelected;
    private _onTrackSelected;
    _onLoadTrack(srcSel: TrackSelection): Promise<boolean>;
    _onLoadAudio(srcSel: TrackSelection): Promise<void>;
    private _onSelectRandom;
    getElementId(): string;
    getCtxMenuElementId(): string;
    getIndex(): number;
}
export declare class CatalogTabPageView<C extends CatalogTabPageController<CatalogTabPageView<C>>> extends TabPageView<C> {
    albumElem: HTMLSelectElement;
    trackElem: HTMLSelectElement;
    loadCatalogTrackElem: HTMLButtonElement;
    selectRandomElem: HTMLButtonElement;
    bind(): Promise<void>;
    refresh(): Promise<void>;
    private _loadAlbumsList;
    refreshTrackSelectionList(): Promise<void>;
    refreshTrackSelectionLabel(trackSel?: TrackSelection): Promise<void>;
    private _annotateTrackSelection;
    static ELEM_ID: string;
    static CTX_MENU_ELEM_ID: string;
}
export declare class CatalogPlaylistIterator implements PlaylistIterator {
    static SEL_CONTEXT: string;
    private _controller;
    private _catalogItrSel;
    private _size;
    constructor(ctrl: CatalogTabPageController<CatalogTabPageView<any>>);
    setContext(ctx: TrackSelection): Promise<void>;
    size(): number;
    hasPrev(): boolean;
    hasNext(): boolean;
    prev(): Promise<TrackSelection>;
    next(): Promise<TrackSelection>;
    current(): TrackSelection;
}
