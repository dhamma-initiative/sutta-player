import { AlbumPlayerState } from "../models/album-player-state.js";
import { SuttaPlayerView } from "../views/sutta-player-view.js";
import { SuttaPlayerController } from "./sutta-player-controller.js";
export interface MatchRef {
    baseRef: string;
    lineRef: string;
}
export declare class SearchController {
    private _model;
    private _view;
    private _mainCtrl;
    private _searchControl;
    private _occurances;
    private _tracks;
    private _idxPosMatchMap;
    constructor(mdl: AlbumPlayerState, vw: SuttaPlayerView, ctrl: SuttaPlayerController);
    setup(): Promise<void>;
    tearDown(): Promise<boolean>;
    private _registerListeners;
    private _onPauseSearchResults;
    private _onClearSearchResults;
    private _onSearch;
    private _abortSearchIfRequired;
    private _onSearchResultSelected;
    private _getSearchResultSelection;
    _search(): Promise<void>;
    private _initialiseSearchControl;
    private _registerSearchControlListeners;
    private _notifySearchProgress;
    private _appendResultToTextArea;
    private _estimateNumberOfCharactersForResultsView;
}
