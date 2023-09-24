import { AlbumPlayerState } from "../models/album-player-state.js";
export class SearchController {
    _model;
    _view;
    _mainCtrl;
    _searchControl;
    _occurances = 0;
    _tracks = 0;
    _idxPosMatchMap = new Map();
    constructor(mdl, vw, ctrl) {
        this._model = mdl;
        this._view = vw;
        this._mainCtrl = ctrl;
    }
    async setup() {
        await this._registerListeners();
    }
    async tearDown() {
        this._view = null;
        this._model = null;
        return true;
    }
    async _registerListeners() {
        this._view.searchMenuElem.onclick = async (e) => {
            e.preventDefault();
            this._view.searchDialogElem.open = !this._view.searchDialogElem.open;
        };
        this._view.searchDialogCloseElem.onclick = this._view.searchMenuElem.onclick;
        this._view.searchScopeElem.onchange = async () => {
            this._model.searchScope = this._view.searchScopeElem.selectedIndex;
        };
        this._view.useRegExElem.onchange = async () => {
            this._model.useRegEx = this._view.useRegExElem.checked;
        };
        this._view.regExFlagsElem.onchange = async () => {
            this._model.regExFlags = this._view.regExFlagsElem.value;
        };
        this._view.ignoreDiacriticsElem.onchange = async () => {
            this._model.ignoreDiacritics = this._view.ignoreDiacriticsElem.checked;
        };
        const searchFormElem = this._view.searchForElem.parentElement;
        searchFormElem.onsubmit = async (e) => {
            e.preventDefault();
            await this._onSearch();
        };
        this._view.searchForElem.addEventListener('keyup', (keyboardEvent) => {
            if (keyboardEvent.key === 'Enter')
                this._view.searchForElem.blur();
        });
        this._view.pauseSearchResultsElem.onchange = async () => {
            this._onPauseSearchResults();
        };
        this._view.clearSearchResultsElem.onclick = async (e) => {
            e.preventDefault();
            this._onClearSearchResults();
        };
        this._view.searchResultsElem.onclick = async (e) => {
            await this._onSearchResultSelected();
        };
    }
    async _onPauseSearchResults() {
        const isPaused = this._view.pauseSearchResultsElem.checked;
        this._searchControl.pause(isPaused);
    }
    _onClearSearchResults() {
        if (this._model.startSearch && !this._view.pauseSearchResultsElem.checked) {
            this._mainCtrl.showUserMessage('Pause search before clearing results!');
            return;
        }
        this._view.searchResultsElem.innerHTML = '';
        this._idxPosMatchMap.clear();
    }
    async _onSearch() {
        this._model.startSearch = !this._model.startSearch;
        await this._abortSearchIfRequired();
        if (this._model.startSearch)
            await this._search();
    }
    async _abortSearchIfRequired() {
        if (this._searchControl && (this._searchControl.context.state >= -1)) {
            await this._searchControl.abort();
            this._searchControl = null;
            this._model.startSearch = false;
        }
    }
    async _onSearchResultSelected() {
        if (typeof this._view.searchResultsElem.selectionStart == 'undefined')
            return false;
        const rsltSel = await this._getSearchResultSelection();
        if (!rsltSel)
            return false;
        await this._mainCtrl._onLoadIntoNavSelector(rsltSel);
        await this._mainCtrl._onLoadText(rsltSel);
        this._view.audioPlayerElem.pause();
        const lineChars = AlbumPlayerState.fromLineRef(rsltSel.context);
        this._view.scrollToTextLineNumber(lineChars[0], lineChars[1]);
        this._model.bookmarkSel.read(rsltSel);
        this._model.bookmarkSel.set(null, null, rsltSel.context);
        this._view.refreshSkipAudioToLine();
        this._mainCtrl.showUserMessage(`Loading match on line ${lineChars[0]} of ${rsltSel.baseRef}`);
        await this._mainCtrl._onLoadAudio(rsltSel);
    }
    async _getSearchResultSelection() {
        let text = this._view.searchResultsElem.value;
        let before = text.substring(0, this._view.searchResultsElem.selectionStart);
        let after = text.substring(this._view.searchResultsElem.selectionEnd, text.length);
        let startPos = before.lastIndexOf("\n") >= 0 ? before.lastIndexOf("\n") + 1 : 0;
        const matchRef = this._idxPosMatchMap.get(startPos);
        if (!matchRef)
            return null;
        let endPos = after.indexOf("\n") >= 0 ? this._view.searchResultsElem.selectionEnd + after.indexOf("\n") : text.length;
        this._view.searchResultsElem.selectionStart = startPos;
        this._view.searchResultsElem.selectionEnd = endPos;
        const ret = await this._mainCtrl._albumStore.queryTrackSelection(matchRef.baseRef);
        ret.context = matchRef.lineRef;
        return ret;
    }
    async _search() {
        if (this._view.searchForElem.value.length === 0) {
            this._view.searchSectionElem.open = false;
            return;
        }
        if (this._view.searchForElem.value.length < 2) {
            this._mainCtrl.showUserMessage('Search criteria must have at least two characters');
            return;
        }
        this._initialiseSearchControl();
        this._registerSearchControlListeners();
        await this._searchControl.start();
    }
    _initialiseSearchControl() {
        this._view.searchResultsElem.innerHTML = '';
        this._idxPosMatchMap.clear();
        this._view.searchSectionElem.open = true;
        this._model.searchFor = this._view.searchForElem.value;
        const criteria = {
            albumIndex: this._model.navSel.albumIndex,
            searchFor: this._model.searchFor,
            searchScope: this._model.searchScope,
            useRegEx: this._model.useRegEx,
            regExFlags: this._model.regExFlags,
            ignoreDiacritics: this._model.ignoreDiacritics,
            maxMatchSurroundingChars: this._estimateNumberOfCharactersForResultsView(),
            state: -1
        };
        this._searchControl = this._mainCtrl._albumStore.createSearchControl(criteria);
        this._tracks = 0;
        this._occurances = 0;
    }
    _registerSearchControlListeners() {
        this._searchControl.onStarted = () => {
            this._view.pauseSearchResultsElem.disabled = false;
            this._view.searchSectionLabelElem.setAttribute('aria-busy', 'true');
        };
        this._searchControl.onMatched = (ref, cargo) => {
            let { occurances: occurances, tracks: tracks } = cargo;
            this._occurances = occurances;
            if (tracks > this._tracks) {
                this._view.searchResultsElem.innerHTML += (this._view.searchResultsElem.textLength === 0 ? '' : '\n\n') + ref.baseRef;
                this._tracks = tracks;
            }
            this._appendResultToTextArea(ref.baseRef, ref.surroundingContext, ref.totalLength, ref.idxPos, ref.lineNum);
        };
        this._searchControl.onPaused = (paused, cargo) => {
            if (paused) {
                let { occurances: occurances, tracks: tracks } = cargo;
                this._occurances = occurances;
                this._tracks = tracks;
                this._notifySearchProgress();
            }
        };
        this._searchControl.onFinished = (cargo) => {
            let { occurances: occurances, tracks: tracks } = cargo;
            this._occurances = occurances;
            this._tracks = tracks;
            this._notifySearchProgress();
            this._model.startSearch = false;
            this._searchControl = null;
            this._view.searchSectionLabelElem.setAttribute('aria-busy', 'false');
            this._model.startSearch = false;
            this._view.pauseSearchResultsElem.disabled = true;
        };
    }
    _notifySearchProgress() {
        this._mainCtrl.showUserMessage(`${this._occurances} results in ${this._tracks} tracks`);
    }
    _appendResultToTextArea(baseRef, matchCtx, srcLen, idxPos, lineNum) {
        const startPos = this._view.searchResultsElem.textLength + 1;
        matchCtx = `\n…${matchCtx}… - ${lineNum}`;
        this._view.searchResultsElem.innerHTML += matchCtx;
        const perc = (idxPos / srcLen) * 100;
        const lineRef = AlbumPlayerState.toLineRef(lineNum, idxPos, perc, 0, 0);
        this._idxPosMatchMap.set(startPos, { baseRef: baseRef, lineRef: lineRef });
    }
    _estimateNumberOfCharactersForResultsView() {
        const computedStyle = window.getComputedStyle(this._view.searchResultsElem);
        const fontSize = parseFloat(computedStyle.getPropertyValue('font-size')) * 0.45;
        const maxChars = Math.floor(this._view.searchResultsElem.clientWidth / fontSize);
        return maxChars * 1.5; // extra for 2 lines in for textarea
    }
}
//# sourceMappingURL=search-controller.js.map