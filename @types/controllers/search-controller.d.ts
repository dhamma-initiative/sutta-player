import { AlbumPlayerState } from "../models/album-player-state.js";
import { SuttaPlayerView } from "../views/sutta-player-view.js";
import { SuttaPlayerController } from "./sutta-player-controller.js";
export interface MatchRef {
    baseRef: string;
    lineRef: string;
}
export declare class SearchController {
    static DIACRITICS_CHR: string[];
    static DIACRITICS_ALT: string[];
    private _model;
    private _view;
    private _mainCtrl;
    private _searchSel;
    private _maxSurroundingChars;
    private _idxPosMatchMap;
    private _continueSearchDeferred;
    constructor(mdl: AlbumPlayerState, vw: SuttaPlayerView, ctrl: SuttaPlayerController);
    setup(): Promise<void>;
    tearDown(): Promise<boolean>;
    private _registerListeners;
    private _onPauseSearchResults;
    private _onClearSearchResults;
    private _onSearchFor;
    private _abortSearchIfRequired;
    private _onSearchResultSelected;
    private _getSearchResultSelection;
    onStartSearch(): Promise<boolean>;
    private _initialiseSearch;
    private _searchPreferencedAlbums;
    private _notifySearchProgress;
    private _reportMatches;
    private _appendResultToTextArea;
    private _getTrackSource;
    private removeDiacritics;
    private _getTrackCount;
    private _getAlbumIndexes;
    private _estimateNumberOfCharactersForResultsView;
}
