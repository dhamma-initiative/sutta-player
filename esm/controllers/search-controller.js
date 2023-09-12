import { AlbumPlayerState, TrackSelection } from "../models/album-player-state.js";
import { StringUtils } from '../runtime/string-utils.js';
export class SearchController {
    static DIACRITICS_CHR = ["ā", "ī", "ū", "ṁ", "ṃ", "ṇ", "ṅ", "ñ", "ṣ", "ṭ", "ḍ", "ḷ", "ḥ"];
    static DIACRITICS_ALT = ["a", "i", "u", "m", "m", "n", "n", "n", "s", "t", "d", "l", "h"];
    _model;
    _view;
    _mainCtrl;
    _searchSel = new TrackSelection('searchSel');
    _maxSurroundingChars = 150;
    constructor(mdl, vw, ctrl) {
        this._model = mdl;
        this._view = vw;
        this._mainCtrl = ctrl;
    }
    async setup() {
        this._registerListeners();
    }
    async tearDown() {
        this._view = null;
        this._model = null;
        return true;
    }
    _registerListeners() {
        this._view.searchResultsElem.onclick = async (e) => {
            await this._onSearchResultSelected();
        };
        const searchResultsSummaryElem = document.getElementById('searchResultSummary');
        const searchFormElem = this._view.searchForElem.parentElement;
        searchFormElem.onsubmit = async (e) => {
            e.preventDefault();
            await this._onSearchFor(searchResultsSummaryElem);
        };
    }
    async _onSearchFor(searchResultsSummaryElem) {
        this._model.startSearch = !this._model.startSearch;
        const elem = document.getElementById('offlineMenuBusy');
        if (this._model.startSearch) {
            await this.onStartSearch();
            this._model.startSearch = false;
        }
    }
    async _onSearchResultSelected() {
        const rsltSel = this._getSearchResultSelection();
        this._mainCtrl._onLoadIntoNavSelector(rsltSel);
        await this._mainCtrl._onLoadAudio(rsltSel);
        this._view.audioPlayerElem.pause();
        if (!this._model.linkTextToAudio)
            await this._mainCtrl._onLoadText(rsltSel);
        const lineChars = AlbumPlayerState.fromLineRef(rsltSel.context);
        this._view.scrollToTextLineNumber(lineChars[0], lineChars[1]);
        this._model.bookmarkLineRef = rsltSel.context;
        this._view.refreshSkipAudioToLine();
        this._mainCtrl.showUserMessage(`Loading match on line ${lineChars[0]} of ${rsltSel.baseRef}`);
    }
    _getSearchResultSelection() {
        const opt = this._view.searchResultsElem.selectedOptions[0];
        const baseRef = opt.parentElement.label;
        const ret = this._mainCtrl._albumStore.queryTrackSelection(baseRef);
        ret.context = this._view.searchResultsElem.value;
        return ret;
    }
    async onStartSearch() {
        if (!this._model.startSearch)
            return false;
        this._initialiseSearch();
        if (this._view.searchForElem.value.length === 0) {
            this._view.searchSectionElem.open = false;
            this._mainCtrl.showUserMessage('Search results cleared');
            return false;
        }
        if (this._view.searchForElem.value.length < 2) {
            this._mainCtrl.showUserMessage('Search criteria must have at least two characters');
            return false;
        }
        await this._searchPreferencedAlbums();
        this._model.startSearch = false;
        return true;
    }
    _initialiseSearch() {
        this._view.searchResultsElem.innerHTML = '';
        this._view.searchSectionElem.open = true;
        this._maxSurroundingChars = this._estimateNumberOfCharactersForSelect();
        this._model.searchFor = this._view.searchForElem.value;
    }
    async _searchPreferencedAlbums() {
        let tracks = 0;
        const albumSrcIndexes = this._getAlbumIndexes();
        for (let i = 0; i < albumSrcIndexes.length; i++) {
            if (!this._model.startSearch)
                break;
            this._searchSel.albumIndex = albumSrcIndexes[i];
            const trackCount = this._getTrackCount();
            for (let j = 0; j < trackCount; j++) {
                if (!this._model.startSearch)
                    break;
                this._searchSel.trackIndex = j;
                this._searchSel.updateBaseRef(this._mainCtrl._albumStore);
                const src = await this._getTrackSource();
                tracks = this._reportMatches(src, tracks);
            }
        }
        const occurances = this._view.searchResultsElem.length;
        this._mainCtrl.showUserMessage(`${occurances} results in ${tracks} tracks`);
    }
    _reportMatches(src, tracks) {
        const searchFor = this._model.searchFor;
        const indexPositions = this._model.useRegEx ? StringUtils.allIndexOfUsingRegEx(src, searchFor) : StringUtils.allIndexesOf(src, searchFor);
        if (indexPositions.length > 0) {
            tracks++;
            const optGrp = this._createOptionGroupElem();
            const linePositions = StringUtils.allLinePositions(src, indexPositions);
            for (let i = 0; i < indexPositions.length; i++) {
                this._appendResultToGroup(src, indexPositions[i], linePositions[i], optGrp);
            }
        }
        return tracks;
    }
    _appendResultToGroup(src, idxPos, lineNum, elem) {
        const matchCtx = StringUtils.surroundingTrim(src, idxPos, this._maxSurroundingChars);
        const opt = document.createElement('option');
        opt.label = matchCtx;
        const perc = (idxPos / src.length) * 100;
        const lineRef = AlbumPlayerState.toLineRef(lineNum, idxPos, perc, 0, 0);
        opt.value = lineRef;
        elem.append(opt);
    }
    _createOptionGroupElem() {
        const optGrp = document.createElement('optgroup');
        optGrp.label = this._searchSel.baseRef;
        this._view.searchResultsElem.append(optGrp);
        return optGrp;
    }
    async _getTrackSource() {
        let src = await this._mainCtrl._albumStore.queryTrackText(this._searchSel.baseRef);
        if (this._model.ignoreDiacritics)
            src = this.removeDiacritics(src);
        return src;
    }
    removeDiacritics(src) {
        for (let i = 0; i < SearchController.DIACRITICS_CHR.length; i++)
            src = src.replaceAll(SearchController.DIACRITICS_CHR[i], SearchController.DIACRITICS_ALT[i]);
        return src;
    }
    _getTrackCount() {
        const trackSrcRefs = this._mainCtrl._albumStore.queryTrackReferences(this._searchSel.albumIndex);
        return trackSrcRefs.length;
    }
    _getAlbumIndexes() {
        const ret = [this._model.navSel.albumIndex];
        if (this._model.searchAlbums > 0) {
            if (this._model.searchAlbums === 1 && !this._model.isAlbumDownloaded(this._model.navSel.albumIndex))
                ret.pop(); // remove the default this._model.navSel.albumIndex entry
            const albumSrcRefs = this._mainCtrl._albumStore.queryAlbumReferences();
            for (let i = 0; i < albumSrcRefs.length; i++) {
                if (ret.indexOf(i) === -1) {
                    let addToCriteria = true;
                    if (this._model.searchAlbums === 1 && !this._model.isAlbumDownloaded(i))
                        addToCriteria = false;
                    if (addToCriteria)
                        ret.push(i);
                }
            }
        }
        return ret;
    }
    _estimateNumberOfCharactersForSelect() {
        const computedStyle = window.getComputedStyle(this._view.searchResultsElem);
        const fontSize = parseFloat(computedStyle.getPropertyValue('font-size')) * 0.45;
        const maxChars = Math.floor(this._view.searchResultsElem.clientWidth / fontSize);
        return maxChars;
    }
}
//# sourceMappingURL=search-controller.js.map