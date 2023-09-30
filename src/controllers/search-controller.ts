import { AlbumPlayerState, TrackSelection } from "../models/album-player-state.js"
import { MatchedSearchRef, SearchContext, SearchControl } from "../models/album-storage-queryable.js"
import { SuttaPlayerView } from "../views/sutta-player-view.js"
import { SuttaPlayerController } from "./sutta-player-controller.js"

export interface MatchRef {
    baseRef: string
    lineRef: string
}

export class SearchController {
    private _model: AlbumPlayerState
    private _view: SuttaPlayerView
    private _mainCtrl: SuttaPlayerController

    private _searchControl: SearchControl
    private _occurances = 0
    private _tracks = 0
    private _idxPosMatchMap = new Map<number, MatchRef>()

    public constructor(mdl: AlbumPlayerState, vw: SuttaPlayerView, ctrl: SuttaPlayerController) {
        this._model = mdl
        this._view = vw
        this._mainCtrl = ctrl
    }

    public async setup() {
        await this._registerListeners()
    }

    public async tearDown(): Promise<boolean> {
        this._view = null
        this._model = null
        return true
    }

    private async _registerListeners() {
        this._view.searchScopeElem.onchange = async () => {
            this._model.searchScope = this._view.searchScopeElem.selectedIndex
        }
        this._view.useRegExElem.onchange = async () => {
            this._model.useRegEx = this._view.useRegExElem.checked
            if (this._model.useRegEx) {
                this._model.applyAndBetweenTerms = false
                this._view.applyAndBetweenTermsElem.checked = false
            }
        }
        this._view.regExFlagsElem.onchange = async () => {
            this._model.regExFlags = this._view.regExFlagsElem.value
        }
        this._view.applyAndBetweenTermsElem.onchange = async () => {
            this._model.applyAndBetweenTerms = this._view.applyAndBetweenTermsElem.checked
            if (this._model.applyAndBetweenTerms) {
                this._model.useRegEx = false
                this._view.useRegExElem.checked = false
            }
        }
        this._view.ignoreDiacriticsElem.onchange = async () => {
            this._model.ignoreDiacritics = this._view.ignoreDiacriticsElem.checked
        }
        const searchFormElem = <HTMLFormElement> this._view.searchForElem.parentElement
        searchFormElem.onsubmit = async (e: Event) => {
            e.preventDefault()
            await this._onSearch()
        }
        this._view.searchForElem.addEventListener('keyup', (keyboardEvent) => {
            if (keyboardEvent.key === 'Enter') 
                this._view.searchForElem.blur();
        })
        const pauseSearchToggleIconElem = <HTMLElement> document.getElementById('pauseSearchToggleIcon')
        this._view.pauseSearchResultsElem.onchange = async () => {
            const isPaused = this._onPauseSearchResults()
            const nameVal = isPaused ? 'play' : 'pause'
            pauseSearchToggleIconElem.setAttribute('name', nameVal)
        }
        this._view.abortSearchElem.onclick = async (e: Event) => {
            e.preventDefault()
            await this._abortSearchIfRequired()
        }

        this._view.clearSearchResultsElem.onclick = async (e: Event) => {
            e.preventDefault()
            this._onClearSearchResults()
        }
        this._view.searchResultsElem.onclick = async (e: Event) => {
            await this._onSearchResultSelected()
        }
    }

    private _onPauseSearchResults(): boolean {
        const isPaused = this._view.pauseSearchResultsElem.checked
        if (this._searchControl)
            this._searchControl.pause(isPaused)
        return isPaused
    }

    private _onClearSearchResults() {
        if (this._model.startSearch && !this._view.pauseSearchResultsElem.checked) {
            this._mainCtrl.showUserMessage('Pause search before clearing results!')
            return
        }
        this._view.searchResultsElem.innerHTML = ''
        this._idxPosMatchMap.clear()
    }

    private async _onSearch() {
        this._model.startSearch = !this._model.startSearch
        await this._abortSearchIfRequired()
        if (this._model.startSearch) 
            await this._search()
    }

    private async _abortSearchIfRequired() {
        if (this._searchControl && (this._searchControl.context.state >= -1)) {
            await this._searchControl.abort()
            this._searchControl = null
            this._model.startSearch = false
        }
    }

    private async _onSearchResultSelected() {
        if (typeof this._view.searchResultsElem.selectionStart == 'undefined') 
            return false
        const rsltSel = await this._getSearchResultSelection()
        if (!rsltSel)
            return false
        // await this._mainCtrl._onRevealInCatalog(rsltSel)
        await this._mainCtrl._onLoadTrack(rsltSel)
        this._view.audioPlayerElem.pause()
        const lineChars = AlbumPlayerState.fromLineRef(rsltSel.context)
        this._view.scrollToTextLineNumber(lineChars[0], lineChars[1])
        this._model.bookmarkSel.read(rsltSel)
        this._model.bookmarkSel.set(null, null, rsltSel.context)
        this._view.refreshSkipAudioToLine()
        this._mainCtrl.showUserMessage(`Loading match on line ${lineChars[0]} of ${rsltSel.baseRef}`)
        await this._mainCtrl._onLoadAudio(rsltSel)
    }

    private async _getSearchResultSelection(): Promise<TrackSelection> {
        let text = this._view.searchResultsElem.value
        let before = text.substring(0, this._view.searchResultsElem.selectionStart)
        let after = text.substring(this._view.searchResultsElem.selectionEnd, text.length);
        let startPos = before.lastIndexOf("\n") >= 0 ? before.lastIndexOf("\n") + 1 : 0
        const matchRef = this._idxPosMatchMap.get(startPos)
        if (!matchRef)
            return null
        let endPos = after.indexOf("\n") >= 0 ? this._view.searchResultsElem.selectionEnd + after.indexOf("\n") : text.length
        this._view.searchResultsElem.selectionStart = startPos
        this._view.searchResultsElem.selectionEnd = endPos
        const ret = await this._mainCtrl._albumStore.queryTrackSelection(matchRef.baseRef)
        ret.context = matchRef.lineRef
        return ret
    }

    public async _search() {
        if (this._view.searchForElem.value.length === 0) {
            return
        }
        if (this._view.searchForElem.value.length < 2) {
            this._mainCtrl.showUserMessage('Search criteria must have at least two characters')
            return
        }
        this._initialiseSearchControl()
        this._registerSearchControlListeners()
        await this._searchControl.start()
    }

    private _initialiseSearchControl() {
        this._view.searchResultsElem.innerHTML = ''
        this._idxPosMatchMap.clear()
        this._model.searchFor = this._view.searchForElem.value
        const criteria: SearchContext = {
            albumIndex: this._model.catSel.albumIndex,
            searchFor: this._model.searchFor,
            searchScope: this._model.searchScope,
            useRegEx: this._model.useRegEx,
            regExFlags: this._model.regExFlags,
            applyAndBetweenTerms: this._model.applyAndBetweenTerms,
            ignoreDiacritics: this._model.ignoreDiacritics,
            maxMatchSurroundingChars: this._estimateNumberOfCharactersForResultsView(),
            state: -1
        }
        this._searchControl = this._mainCtrl._albumStore.createSearchControl(criteria)
        this._tracks = 0
        this._occurances = 0
    }

    private _registerSearchControlListeners() {
        this._searchControl.onStarted = () => {
            this._view.pauseSearchResultsElem.disabled = false
            this._view.searchResultsLabelElem.setAttribute('aria-busy', 'true')
        }
        this._searchControl.onSearchingTrack = (baseRef: string, cargo?: any) => {
            let { occurances: occurances, tracks: tracks } = cargo
            this._occurances = occurances
            this._tracks = tracks
            this._view.searchResultsLabelElem.innerHTML = `Searching: ${baseRef}`
        }
        this._searchControl.onMatched = (ref: MatchedSearchRef, cargo?: any) => {
            let { occurances: occurances, tracks: tracks } = cargo
            this._occurances = occurances
            if (tracks > this._tracks) {
                this._view.searchResultsElem.innerHTML += (this._view.searchResultsElem.textLength === 0 ? '' : '\n\n') + ref.baseRef
                this._tracks = tracks
            }
            this._appendResultToTextArea(ref.baseRef, ref.surroundingContext, ref.totalLength, ref.idxPos, ref.lineNum)
        }
        this._searchControl.onPaused = (paused: boolean, cargo?: any) => {
            if (paused) {
                let { occurances: occurances, tracks: tracks } = cargo
                this._occurances = occurances
                this._tracks = tracks                
                this._notifySearchProgress()
            }
        }
        this._searchControl.onFinished = (cargo?: any) => {
            if (cargo) {
                let { occurances: occurances, tracks: tracks } = cargo
                this._occurances = occurances
                this._tracks = tracks
                this._notifySearchProgress()
            }
            this._model.startSearch = false
            this._searchControl = null
            this._view.searchResultsLabelElem.innerHTML = `Results:`
            this._view.searchResultsLabelElem.setAttribute('aria-busy', 'false')
            this._model.startSearch = false
            this._view.pauseSearchResultsElem.checked = false
            this._view.pauseSearchResultsElem.onchange(null)
            this._view.pauseSearchResultsElem.disabled = true
        }
        this._searchControl.onAborted = this._searchControl.onFinished
    }

    private _notifySearchProgress() {
        this._mainCtrl.showUserMessage(`${this._occurances} results in ${this._tracks} tracks`)
    }

    private _appendResultToTextArea(baseRef: string, matchCtx: string, srcLen: number, idxPos: number, lineNum: number) {
        const startPos = this._view.searchResultsElem.textLength + 1
        matchCtx = `\n…${matchCtx}… - ${lineNum}`
        this._view.searchResultsElem.innerHTML += matchCtx
        const perc = (idxPos/srcLen)*100
        const lineRef = AlbumPlayerState.toLineRef(lineNum, idxPos, perc, 0, 0)
        this._idxPosMatchMap.set(startPos, {baseRef: baseRef, lineRef: lineRef})
    }

    private _estimateNumberOfCharactersForResultsView() {
        const computedStyle = window.getComputedStyle(this._view.searchResultsElem)
        const fontSize = parseFloat(computedStyle.getPropertyValue('font-size')) * 0.45
        const maxChars = Math.floor(this._view.searchResultsElem.clientWidth / fontSize)
        return maxChars * 1.5 // extra for 2 lines in for textarea
    }
}