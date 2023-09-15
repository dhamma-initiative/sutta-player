import { start } from "repl"
import { AlbumPlayerState, TrackSelection } from "../models/album-player-state.js"
import { DeferredPromise } from "../runtime/deferred-promise.js"
import { StringUtils } from '../runtime/string-utils.js'
import { SuttaPlayerView } from "../views/sutta-player-view.js"
import { SuttaPlayerController } from "./sutta-player-controller.js"

export interface MatchRef {
    baseRef: string
    lineRef: string
}

export class SearchController {
    public static DIACRITICS_CHR = ["ā", "ī", "ū", "ṁ", "ṃ", "ṇ", "ṅ", "ñ", "ṣ", "ṭ", "ḍ", "ḷ", "ḥ"]
    public static DIACRITICS_ALT = ["a", "i", "u", "m", "m", "n", "n", "n", "s", "t", "d", "l", "h"]

    private _model: AlbumPlayerState
    private _view: SuttaPlayerView
    private _mainCtrl: SuttaPlayerController

    private _searchSel: TrackSelection = new TrackSelection('searchSel')
    private _maxSurroundingChars = 150
    private _idxPosMatchMap = new Map<number, MatchRef>()
    private _continueSearchDeferred: DeferredPromise<boolean>

    public constructor(mdl: AlbumPlayerState, vw: SuttaPlayerView, ctrl: SuttaPlayerController) {
        this._model = mdl
        this._view = vw
        this._mainCtrl = ctrl
    }

    public async setup() {
        this._registerListeners()
    }

    public async tearDown(): Promise<boolean> {
        this._view = null
        this._model = null
        return true
    }

    private async _registerListeners() {
        const searchFormElem = <HTMLFormElement> this._view.searchForElem.parentElement
        searchFormElem.onsubmit = async (e: Event) => {
            e.preventDefault()
            await this._onSearchFor()
        }
        this._view.pauseSearchResultsElem.onchange = async () => {
            this._onPauseSearchResults()
        }
        this._view.clearSearchResultsElem.onclick = async (e: Event) => {
            e.preventDefault()
            this._onClearSearchResults()
        }
        this._view.searchResultsElem.onclick = async (e: Event) => {
            this._onSearchResultSelected()
        }
    }

    private _onPauseSearchResults() {
        if (this._view.pauseSearchResultsElem.checked)
            this._continueSearchDeferred = new DeferredPromise<boolean>()
        else if (this._continueSearchDeferred) {
            this._continueSearchDeferred.resolve(true)
            this._continueSearchDeferred = null
        }
    }

    private _onClearSearchResults() {
        if (this._model.startSearch && !this._view.pauseSearchResultsElem.checked) {
            this._mainCtrl.showUserMessage('Pause search before clearing results!')
            return
        }
        this._view.searchResultsElem.innerHTML = ''
        this._idxPosMatchMap.clear()
    }

    private async _onSearchFor() {
        this._model.startSearch = !this._model.startSearch
        this._abortSearchIfRequired()
        if (this._model.startSearch) {
            this._view.pauseSearchResultsElem.disabled = false    
            await this.onStartSearch()
            this._model.startSearch = false
            this._view.pauseSearchResultsElem.disabled = true
        }
    }

    private _abortSearchIfRequired() {
        if (this._continueSearchDeferred) {
            this._continueSearchDeferred.reject('Search aborted!')
            this._continueSearchDeferred = null
        }
    }

    private async _onSearchResultSelected() {
        if (typeof this._view.searchResultsElem.selectionStart == 'undefined') 
            return false
        const rsltSel = this._getSearchResultSelection()
        if (!rsltSel)
            return false
        this._mainCtrl._onLoadIntoNavSelector(rsltSel)
        await this._mainCtrl._onLoadAudio(rsltSel)
        this._view.audioPlayerElem.pause()
        if (!this._model.linkTextToAudio)
            await this._mainCtrl._onLoadText(rsltSel)
        const lineChars = AlbumPlayerState.fromLineRef(rsltSel.context)
        this._view.scrollToTextLineNumber(lineChars[0], lineChars[1])
        this._model.bookmarkSel.read(rsltSel)
        this._model.bookmarkSel.set(null, null, rsltSel.context)
        this._view.refreshSkipAudioToLine()
        this._mainCtrl.showUserMessage(`Loading match on line ${lineChars[0]} of ${rsltSel.baseRef}`)
    }

    private _getSearchResultSelection(): TrackSelection {
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
        const ret = this._mainCtrl._albumStore.queryTrackSelection(matchRef.baseRef)
        ret.context = matchRef.lineRef
        return ret
    }

    public async onStartSearch(): Promise<boolean> {
        if (!this._model.startSearch) {
            this._abortSearchIfRequired()
            return false
        }
        this._initialiseSearch()
        if (this._view.searchForElem.value.length === 0) {
            this._view.searchSectionElem.open = false
            return false
        }
        if (this._view.searchForElem.value.length < 2) {
            this._mainCtrl.showUserMessage('Search criteria must have at least two characters')
            return false
        }
        try {
            await this._searchPreferencedAlbums()
        } catch (e) {
            this._mainCtrl.showUserMessage((<Error>e).message)
        }
        this._model.startSearch = false
        return true
    }

    private _initialiseSearch() {
        this._view.searchResultsElem.innerHTML = ''
        this._idxPosMatchMap.clear()
        this._view.searchSectionElem.open = true
        this._maxSurroundingChars = this._estimateNumberOfCharactersForResultsView()
        this._model.searchFor = this._view.searchForElem.value
    }

    private async _searchPreferencedAlbums() {
        let tracks = 0
        const albumSrcIndexes = this._getAlbumIndexes()
        for (let i = 0; i < albumSrcIndexes.length; i++) {
            if (!this._model.startSearch)
                break
            this._searchSel.albumIndex = albumSrcIndexes[i]
            const trackCount = this._getTrackCount()
            for (let j = 0; j < trackCount; j++) {
                if (!this._model.startSearch)
                    break
                this._searchSel.trackIndex = j
                this._searchSel.updateBaseRef(this._mainCtrl._albumStore)
                if (this._model.searchScope === 1) {
                    const inCache = await this._mainCtrl._albumStore.isInCache(this._searchSel.baseRef)
                    if (!inCache)
                        continue
                }
                const src = await this._getTrackSource()
                tracks = await this._reportMatches(src, tracks)
            }
        }
        this._notifySearchProgress(tracks)
    }

    private _notifySearchProgress(tracks: number) {
        const occurances = this._idxPosMatchMap.size
        this._mainCtrl.showUserMessage(`${occurances} results in ${tracks} tracks`)
    }

    private async _reportMatches(src: string, tracks: number): Promise<number> {
        const searchFor = this._model.searchFor
        const indexPositions = this._model.useRegEx ? StringUtils.allIndexOfUsingRegEx(src, searchFor) : StringUtils.allIndexesOf(src, searchFor) 
        if (indexPositions.length > 0) {
            tracks++
            this._view.searchResultsElem.innerHTML += (tracks === 1 ? '' : '\n\n') + this._searchSel.baseRef
            const linePositions = StringUtils.allLinePositions(src, indexPositions)
            for (let i = 0; i < indexPositions.length; i++) {
                if (this._continueSearchDeferred) {
                    this._notifySearchProgress(tracks)
                    await this._continueSearchDeferred
                }
                this._appendResultToTextArea(src, indexPositions[i], linePositions[i])
            }
        }
        return tracks
    }

    private _appendResultToTextArea(src: string, idxPos: number, lineNum: number) {
        const startPos = this._view.searchResultsElem.textLength + 1
        let matchCtx = StringUtils.surroundingTrim(src, idxPos, this._maxSurroundingChars).replaceAll('\n', ' ')
        matchCtx = `\n…${matchCtx}… - ${lineNum}`
        this._view.searchResultsElem.innerHTML += matchCtx
        const perc = (idxPos/src.length)*100
        const lineRef = AlbumPlayerState.toLineRef(lineNum, idxPos, perc, 0, 0)
        this._idxPosMatchMap.set(startPos, {baseRef: this._searchSel.baseRef, lineRef: lineRef})
    }

    private async _getTrackSource(): Promise<string> {
        let src = await this._mainCtrl._albumStore.queryTrackText(this._searchSel.baseRef)
        if (this._model.ignoreDiacritics) 
            src = this.removeDiacritics(src)
        return src
    }
    
    private removeDiacritics(src: string): string {
        for (let i = 0; i < SearchController.DIACRITICS_CHR.length; i++) 
            src = src.replaceAll(SearchController.DIACRITICS_CHR[i], SearchController.DIACRITICS_ALT[i])
        return src
    }

    private _getTrackCount(): number {
        const trackSrcRefs = this._mainCtrl._albumStore.queryTrackReferences(this._searchSel.albumIndex)
        return trackSrcRefs.length
    }

    private _getAlbumIndexes(): number[] {
        const ret = [this._model.navSel.albumIndex]
        if (this._model.searchScope > 0) {
            const albumSrcRefs = this._mainCtrl._albumStore.queryAlbumReferences()
            for (let i = 0; i < albumSrcRefs.length; i++) {
                if (ret.indexOf(i) === -1) 
                    ret.push(i)
            }
        } 
        return ret
    }

    private _estimateNumberOfCharactersForResultsView() {
        const computedStyle = window.getComputedStyle(this._view.searchResultsElem)
        const fontSize = parseFloat(computedStyle.getPropertyValue('font-size')) * 0.45
        const maxChars = Math.floor(this._view.searchResultsElem.clientWidth / fontSize)
        return maxChars * 1.5 // extra for 2 lines in for textarea
    }
}