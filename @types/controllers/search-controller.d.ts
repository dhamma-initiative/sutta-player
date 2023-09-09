import { SuttaPlayerState } from "../models/sutta-player-state.js";
import { SuttaPlayerView } from "../views/sutta-player-view.js";
import { SuttaPlayerController } from "./sutta-player-controller.js";
export declare class SearchController {
    static DIACRITICS_CHR: string[];
    static DIACRITICS_ALT: string[];
    private _model;
    private _view;
    private _mainCtrl;
    private _searchSel;
    private _maxSurroundingChars;
    constructor(mdl: SuttaPlayerState, vw: SuttaPlayerView, ctrl: SuttaPlayerController);
    setup(): Promise<void>;
    tearDown(): Promise<void>;
    onStartSearch(): Promise<boolean>;
    private _initialiseSearch;
    private _searchPreferencedAlbums;
    private _reportMatches;
    private _appendResultToGroup;
    private _createOptionGroupElem;
    private _getTrackSource;
    private removeDiacritics;
    private _getTrackCount;
    private _getAlbumIndexes;
    private _estimateNumberOfCharactersForSelect;
}
