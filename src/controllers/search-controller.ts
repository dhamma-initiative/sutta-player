import { SuttaPlayerState, TrackSelection } from "../models/sutta-player-state.js"
import { StringUtils } from '../runtime/string-utils.js'
import { SuttaPlayerView } from "../views/sutta-player-view.js"
import { SuttaPlayerController } from "./sutta-player-controller.js"

export class SearchController {
    public static DIACRITICS_CHR = ["ā", "ī", "ū", "ṁ", "ṃ", "ṇ", "ṅ", "ñ", "ṣ", "ṭ", "ḍ", "ḷ", "ḥ"]
    public static DIACRITICS_ALT = ["a", "i", "u", "m", "m", "n", "n", "n", "s", "t", "d", "l", "h"]

    private _model: SuttaPlayerState
    private _view: SuttaPlayerView
    private _mainCtrl: SuttaPlayerController

    private _searchSel: TrackSelection = new TrackSelection('searchSel')
    private _maxSurroundingChars = 150

    public constructor(mdl: SuttaPlayerState, vw: SuttaPlayerView, ctrl: SuttaPlayerController) {
        this._model = mdl
        this._view = vw
        this._mainCtrl = ctrl
    }

    public async setup() {
    }

    public async tearDown() {
        this._view = null
        this._model = null
    }

    public async onStartSearch(): Promise<boolean> {
        if (!this._model.startSearch)
            return false
        this._initialiseSearch()
        if (this._view.searchForElem.value.length === 0) {
            this._view.searchSectionElem.open = false
            this._mainCtrl.showUserMessage('Search results cleared')
            return false
        }
        if (this._view.searchForElem.value.length < 2) {
            this._mainCtrl.showUserMessage('Search criteria must have at least two characters')
            return false
        }
        await this._searchSelectedAlbums()
        this._model.startSearch = false
        return true
    }

    private _initialiseSearch() {
        this._view.searchResultsElem.innerHTML = ''
        this._view.searchSectionElem.open = true
        this._maxSurroundingChars = this._estimateNumberOfCharactersForSelect()
        this._model.searchFor = this._view.searchForElem.value
    }

    private async _searchSelectedAlbums() {
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
                this._searchSel.updateBaseRef(this._mainCtrl._suttaStore)
                const src = await this._getTrackSource()
                tracks = this._reportMatches(src, tracks)
            }
        }
        const occurances = this._view.searchResultsElem.length
        this._mainCtrl.showUserMessage(`${occurances} results in ${tracks} tracks`)
    }

    private _reportMatches(src: string, tracks: number): number {
        const searchFor = this._model.searchFor
        const indexPositions = this._model.useRegEx ? StringUtils.allIndexOfUsingRegEx(src, searchFor) : StringUtils.allIndexesOf(src, searchFor) 
        if (indexPositions.length > 0) {
            tracks++
            const optGrp = this._createOptionGroupElem()
            const linePositions = StringUtils.allLinePositions(src, indexPositions)
            for (let i = 0; i < indexPositions.length; i++) {
                this._appendResultToGroup(src, indexPositions[i], linePositions[i], optGrp)
            }
        }
        return tracks
    }

    private _appendResultToGroup(src: string, idxPos: number, lineNum: number, elem: HTMLOptGroupElement) {
        const matchCtx = StringUtils.surroundingTrim(src, idxPos, this._maxSurroundingChars)
        const opt = document.createElement('option')
        opt.label = matchCtx
        const perc = (idxPos/src.length)*100
        const lineRef = SuttaPlayerState.toLineRef(lineNum, idxPos, perc, 0, 0)
        opt.value = lineRef
        elem.append(opt)
    }

    private _createOptionGroupElem(): HTMLOptGroupElement {
        const optGrp = document.createElement('optgroup')
        optGrp.label = this._searchSel.baseRef
        this._view.searchResultsElem.append(optGrp)
        return optGrp
    }

    private async _getTrackSource(): Promise<string> {
        let src = await this._mainCtrl._suttaStore.queryTrackText(this._searchSel.baseRef)
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
        const trackSrcRefs = this._mainCtrl._suttaStore.queryTrackReferences(this._searchSel.albumIndex)
        return trackSrcRefs.length
    }

    private _getAlbumIndexes(): number[] {
        const ret = [this._model.navSel.albumIndex]
        if (this._model.searchAllAlbums) {
            const albumSrcRefs = this._mainCtrl._suttaStore.queryAlbumReferences()
            for (let i = 0; i < albumSrcRefs.length; i++) {
                if (ret.indexOf(i) === -1)
                    ret.push(i)
            }
        } 
        return ret
    }

    private _estimateNumberOfCharactersForSelect() {
        const computedStyle = window.getComputedStyle(this._view.searchResultsElem)
        const fontSize = parseFloat(computedStyle.getPropertyValue('font-size')) * 0.45
        const maxChars = Math.floor(this._view.searchResultsElem.clientWidth / fontSize)
        return maxChars
    }
}