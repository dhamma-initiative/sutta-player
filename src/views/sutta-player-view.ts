import { AlbumPlayerState, BookmarkedSelection, TrackSelection } from '../models/album-player-state.js'
import { AlbumStorageQueryable } from "../models/album-storage-queryable.js"

export class SuttaPlayerView {
    public static LINEID_PREFIX = '_ln_'
    // Player menu
    homeMenuElem: HTMLInputElement
    catalogMenuElem: HTMLInputElement
    searchMenuElem: HTMLInputElement
    playlistMenuElem: HTMLInputElement
    offlineMenuElem: HTMLInputElement

    homeTabElem: HTMLDivElement
    catalogTabElem: HTMLDivElement
    searchTabElem: HTMLDivElement
    playlistTabElem: HTMLDivElement
    offlineTabElem: HTMLDivElement

    // settings
    autoPlayElem: HTMLInputElement
    playNextElem: HTMLInputElement
    repeatElem: HTMLInputElement
    loadAudioWithTextElem: HTMLInputElement
    showLineNumsElem: HTMLInputElement
    searchScopeElem: HTMLSelectElement
    darkThemeElem: HTMLInputElement

    resetAppMenuElem: HTMLAnchorElement

    // about
    aboutMenuElem: HTMLAnchorElement
    aboutDialogElem: HTMLDialogElement
    aboutDialogCloseElem: HTMLAnchorElement
    aboutTextBodyElem: HTMLParagraphElement

    // selections
    albumElem: HTMLSelectElement
    trackElem: HTMLSelectElement
    loadCatalogTrackElem: HTMLButtonElement
    selectRandomElem: HTMLButtonElement
    shareLinkElem: HTMLButtonElement

    // search
    searchForElem: HTMLInputElement
    searchResultsLabelElem: HTMLSpanElement
    pauseSearchResultsElem: HTMLInputElement
    abortSearchElem: HTMLAnchorElement
    clearSearchResultsElem: HTMLAnchorElement
    searchResultsElem: HTMLTextAreaElement

    useRegExElem: HTMLInputElement
    regExFlagsElem: HTMLInputElement
    applyAndBetweenTermsElem: HTMLInputElement 
    ignoreDiacriticsElem: HTMLInputElement

    // display
    playingTrackElem: HTMLElement
    audioPlayerElem: HTMLAudioElement

    displayingTrackElem: HTMLElement
    revealInCatElem: HTMLAnchorElement
    trackTextBodyElem: HTMLDivElement

    // offline
    offlineAlbumTitleElem: HTMLElement
    offlineTrackTitleElem: HTMLElement
    concurrencyCountElem: HTMLSelectElement
    downloadAlbumElem: HTMLInputElement
    deleteAlbumElem: HTMLInputElement
    addTrackToCacheElem: HTMLButtonElement
    removeTrackFromCacheElem: HTMLButtonElement
    processingInfoElem: HTMLDivElement
    processingProgressElem: HTMLProgressElement

    // reset app
    resetAppDialogElem: HTMLDialogElement
    resetAppCloseElem: HTMLAnchorElement
    resetAppConfirmElem: HTMLAnchorElement

    snackbarElem: HTMLDivElement
    ctxMenuToggleElem: HTMLButtonElement
    ctxMenuToggleIconElem: HTMLElement
    skipAudioToLineElem: HTMLAnchorElement
    scrollTextWithAudioElem: HTMLInputElement

    gotoTopElem: HTMLAnchorElement
    tabSliderElem: HTMLInputElement
    
    tabPageElems: HTMLDivElement[] = []
    tabMenuElems: HTMLInputElement[] = []

    private _model: AlbumPlayerState
    private _albumStore: AlbumStorageQueryable
    private _charPosLineIndex: number[] = []
    
    constructor(mdl: AlbumPlayerState, albumStore: AlbumStorageQueryable) {
        this._model = mdl
        this._albumStore = albumStore
        this._bindHtmlElements()
    }

    public async initialise(cb: (event: MouseEvent) => void) {
        this.loadAlbumsList()
        await this.refreshTrackSelectionList()
        await this.loadTrackTextForUi(cb)
        this.refreshViewSettings()
        const isNewAwaitDurRqd = [false]
        await this.loadTrackAudio(isNewAwaitDurRqd)
        this._finaliseShareLinkLoadIfRqd()
    }

    public openTab(tabNum: number, prevTabNum: number) {
        for (let i = 0; i < this.tabPageElems.length; i++) {
            if (i === tabNum) {
                this.tabMenuElems[i].checked = true
                this.tabPageElems[i].style.display = 'block'
            } else
                this.tabPageElems[i].style.display = 'none'
        }
        if (tabNum === 4)
            this._prepareOfflineTab()
    }

    public refreshViewSettings() {
        this.autoPlayElem.checked = this._model.autoPlay
        this.audioPlayerElem.autoplay = this._model.autoPlay
        this.playNextElem.checked = this._model.playNext
        this.repeatElem.checked = this._model.repeat
        this.audioPlayerElem.loop = this._model.repeat

        this.loadAudioWithTextElem.checked = this._model.loadAudioWithText
        this.scrollTextWithAudioElem.checked = this._model.scrollTextWithAudio

        this.showLineNumsElem.checked = this._model.showLineNums
        this.darkThemeElem.checked = this._model.darkTheme

        this.searchForElem.value = this._model.searchFor
        this.searchScopeElem.selectedIndex = this._model.searchScope
        this.useRegExElem.checked = this._model.useRegEx
        this.regExFlagsElem.value = this._model.regExFlags
        this.applyAndBetweenTermsElem.checked = this._model.applyAndBetweenTerms
        this.ignoreDiacriticsElem.checked = this._model.ignoreDiacritics
        
        this.concurrencyCountElem.selectedIndex = this._model.concurrencyCount
        this.processingProgressElem.value = 0

        this.setColorTheme()
        this.toggleLineNums()
        this.refreshSkipAudioToLine()
        this.showHideContextControls(this._isCtxMenuToggleOpen())
    }

    public async refreshTrackSelectionList() {
        this.trackElem.innerHTML = ''
        const albIdx = this._model.catSel.albumIndex
        const trkIdx = this._model.catSel.trackIndex
        const trackLov = await this._albumStore.queryTrackReferences(albIdx)
        let count = 0
        await this._albumStore.queryAlbumCacheStatus(albIdx, (baseRef, idx, taStatus, cargo) => {
            if (albIdx !== cargo.albumIndex)
                return
            count++
            const option = document.createElement('option')
            option.value = `${idx}`
            option.innerHTML = this._annotateTrackSelection(taStatus, trackLov[idx])
            this.trackElem.add(option, idx)
            if (count === trackLov.length)
                this.trackElem.selectedIndex = trkIdx
        })
    }

    public async refreshTrackSelectionLabel(trackSel?: TrackSelection): Promise<void> {
        if (!trackSel)
            trackSel = this._model.catSel
        const option = this.trackElem.children[trackSel.trackIndex]
        if (!option)
            return
        const taStatus = await this._albumStore.isInCache(trackSel.baseRef, true, true)
        option.innerHTML = this._annotateTrackSelection(taStatus, trackSel.dictionary['trackName'])
    }

    private _annotateTrackSelection(taStatus: boolean[], trackName: string): string {
        let ret = (taStatus[0] && taStatus[1]) ? '✔️' : (taStatus[1]) ? '🔊' : (taStatus[0]) ? '👀' : '◻'
        ret = `${ret} ${trackName}`
        return ret
    }

    public async loadTrackWith(trackSel: TrackSelection): Promise<string> {
        if (trackSel.baseRef === null) 
            return null
        const ret = await this._albumStore.queryTrackText(trackSel.baseRef)
        trackSel.isLoaded = true
        await this.refreshTrackSelectionLabel(trackSel)
        return ret
    }

    public async loadTrackTextForUi(lineSelCb: (event: MouseEvent) => void) {
        if (this._model.homeSel.baseRef === null) 
            return

        const textBody = await this.loadTrackWith(this._model.homeSel)
        this.trackTextBodyElem.innerHTML = ''
        const lines = textBody.split('\n')
        let totalCharLen = 0
        let html = ''
        this._charPosLineIndex = [0]
        for (let i = 0; i < lines.length; i++) {
            html += `<span class=\"line\">${lines[i]}</span>\n`
            totalCharLen += lines[i].length + ((i === lines.length-1) ? 0 : 1)
            this._charPosLineIndex.push(totalCharLen)
        }
        this.trackTextBodyElem.innerHTML = html
        for (let i = 0; i < this.trackTextBodyElem.children.length; i++) {
            const elem: HTMLElement = <HTMLElement> this.trackTextBodyElem.children[i]
            elem.id = SuttaPlayerView.createLineElementId(i+1)
            elem.onclick = lineSelCb
        }
        this.displayingTrackElem.innerHTML = `${this._model.homeSel.baseRef}`
    }

    public createLineRefValues(lineNum: number) {
        const totalCharLen = this._charPosLineIndex[this._charPosLineIndex.length-1] 
        const begIdxPos = this._charPosLineIndex[lineNum-1]
        const begPerc = ((begIdxPos/totalCharLen) * 100)
        const endIdxPos = this._charPosLineIndex[lineNum]
        const endPerc = ((endIdxPos/totalCharLen) * 100)
        const ret = AlbumPlayerState.toLineRef(lineNum, begIdxPos, begPerc, endIdxPos, endPerc)
        return ret
    }

    public setColorTheme() {
        const theme: string = this._model.darkTheme ? 'dark' : 'light'
        document.documentElement.setAttribute('data-theme', theme);
    }

    public scrollToTextLineNumber(lineNum: number, idxPos: number) {
        const idRef = SuttaPlayerView.createLineElementId(lineNum)
        let offset = -window.innerHeight / 2
        const elem = document.getElementById(idRef)
        if (idxPos > -1) {
            const lnPerc = this._charPosToLineNumPercOffset(idxPos)
            if (lnPerc[0] === lineNum) {
                const spanRect = elem.getBoundingClientRect()
                const scrollY = window.scrollY || window.pageYOffset
                const top = spanRect.top + scrollY
                offset += top + Math.round(spanRect.height * lnPerc[1])
            }
        }
        if (elem) 
            window.scroll({top: offset, behavior: "smooth"}) 
    }

    public scrollToTextPercCentred(perc: number) {
        const totalLen = this._charPosLineIndex[this._charPosLineIndex.length-1]
        const idxPos = (totalLen * perc / 100)
        const lnPerc = this._charPosToLineNumPercOffset(idxPos)
        this.scrollToTextLineNumber(lnPerc[0], idxPos)
    }

    public seekToTimePosition(charPos: number, charPerc: number, audDur: number) {
        const seekTo = audDur * (charPerc/100)
        this._model.currentTime = seekTo
        this.audioPlayerElem.currentTime = this._model.currentTime
    }

    public syncTextPositionWithAudio() {
        if (!this._model.scrollTextWithAudio)
            return
        if (this._model.homeSel.baseRef !== this._model.homeSel.baseRef)
            return

        const posPerc = this._getAudioPositionAsPerc()
        this.scrollToTextPercCentred(posPerc)
    }

    public parseLineNumber(idRef: string): number {
        const lnAsStr = idRef.replace(SuttaPlayerView.LINEID_PREFIX, '')
        const ret: number = parseInt(lnAsStr)
        return ret
    }

    public static createLineElementId(lineNum: number): string {
        const idRef = `${SuttaPlayerView.LINEID_PREFIX}${lineNum}`
        return idRef
    }

    public async loadTrackAudio(isNewAwaitDurRqd: boolean[]): Promise<boolean> {
        const success = await this.loadTrackAudioWith(this._model.homeSel, this.audioPlayerElem, isNewAwaitDurRqd)
        if (success) {
            this.audioPlayerElem.currentTime = this._model.currentTime
            if (this._model.bookmarkSel.isAwaitingLoad()) {
                if (this._model.currentTime > -1) {
                    // Uncaught (in promise) DOMException: play() failed because the user didn't interact with the document first. 
                    try {
                        await this.audioPlayerElem.play()
                    } catch (err) {}
                }
            }
        }
        return success
    }

    public async loadTrackAudioWith(trackSel: TrackSelection, audioElem: HTMLAudioElement, isNewAwaitDurRqd: boolean[]): Promise<boolean> {
        isNewAwaitDurRqd[0] = false
        if (trackSel.baseRef === null)
            return false
        const srcRef = this._albumStore.queryTrackHtmlAudioSrcRef(trackSel.baseRef)
        if (srcRef === audioElem.src && this._model.getAudioState() >= 1)
            return true
        this._model.setAudioState(0)
        audioElem.src = srcRef
        isNewAwaitDurRqd[0] = true
        this._model.setAudioState(1)
        trackSel.isLoaded = true
        return true
    }

    public updatePlayingTrackInfo(baseRef: string, status: string) {
        const info = status ? ` [${status}]` : ''
        this.playingTrackElem.innerHTML = info
    }

    public showMessage(msg: string, dur = 3000) {
        this.snackbarElem.textContent = msg
        this.snackbarElem.classList.add('show')
        setTimeout(() => {
            this.snackbarElem.classList.remove('show')
        }, dur)
    }

    public toggleLineNums() {
        if (this.showLineNumsElem.checked)
            this.trackTextBodyElem.classList.add('displayLineNums')
        else
            this.trackTextBodyElem.classList.remove('displayLineNums')
    }

    public async toggleAboutInfo(event: any) {
        if (event)
            event.preventDefault()
        if (this.aboutTextBodyElem.textContent.trim() === '') {
            let textBody = await this._albumStore.readTextFile('./README.md')
            textBody = textBody.replaceAll('###', '-')
            textBody = textBody.replaceAll('#', '')
            this.aboutTextBodyElem.textContent = textBody + 'suttaplayer@gmail.com'
        } else
            this.aboutTextBodyElem.textContent = ''
        this.aboutDialogElem.open = !this.aboutDialogElem.open
    }

    private async _prepareOfflineTab() {
        if (this._model.stopDwnlDel === 0) {
            const albumName = this.albumElem.children[this.albumElem.selectedIndex].textContent
            this.offlineAlbumTitleElem.textContent = albumName
            this.offlineTrackTitleElem.textContent = this._model.catSel.baseRef
        }
    }

    public toggleResetAppDialog(event: any) {
        if (event)
            event.preventDefault()
        this.resetAppDialogElem.open = !this.resetAppDialogElem.open
    }

    public updateOfflineInfo(processingInfo: string, perc: number) {
        let actn = ''
        if (this._model.stopDwnlDel === 1)
            actn = 'Downloading'
        else if (this._model.stopDwnlDel === 2)
            actn = 'Deleting'
        this.processingInfoElem.textContent = `${actn} ${processingInfo}`
        if (perc > -1)
            this.processingProgressElem.value = perc
    }

    public refreshSkipAudioToLine() {
        if (this._model.bookmarkSel.lineRef) {
            const vals = AlbumPlayerState.fromLineRef(this._model.bookmarkSel.lineRef)
            const el = document.getElementById('skipAudioToLineLabel')
            el.innerHTML = `Line ${vals[0]}`
            this.skipAudioToLineElem.style.display = 'initial'
        } else
            this.skipAudioToLineElem.style.display = 'none'
    }

    public loadAlbumsList() {
        this.albumElem.innerHTML = ''
        const colLov = this._albumStore.queryAlbumNames() 
        for (let i = 0; i < colLov.length; i++) {
            const option = document.createElement('option')
            option.value = `${i}`
            option.innerHTML = `${colLov[i]}`
            this.albumElem.append(option)
        }
        this.albumElem.selectedIndex = this._model.catSel.albumIndex
    }

    public showHideContextControls(show: boolean) {
        const dispStyle = show ? 'block' : 'none'
        const sections = ['lhsFabSection', 'centreFabSection', 'rhsFabSection']
        for (let i = 0; i < sections.length; i++) {
            const elem = document.getElementById(sections[i])
            elem.style.display = dispStyle
        }
    }

    private _finaliseShareLinkLoadIfRqd() {
        if (this._model.bookmarkSel.isAwaitingLoad()) {
            if (this._model.bookmarkSel.endTime > -1)
                this._model.bookmarkSel.context = BookmarkedSelection.AWAITING_AUDIO_END
            else
                this._model.bookmarkSel.context = BookmarkedSelection.CONTEXT
        }
        if (this._model.bookmarkSel.lineRef) {
            const lineRefVals = AlbumPlayerState.fromLineRef(this._model.bookmarkSel.lineRef)
            this.scrollToTextLineNumber(lineRefVals[0], lineRefVals[1])
        } else
            window.scroll(0, this._model.currentScrollY)
    }

    private _isCtxMenuToggleOpen(): boolean {
        let colorVal = this.ctxMenuToggleIconElem.getAttribute('color')
        return colorVal !== null
    }

    private _bindHtmlElements() {
        this._bindTabElements()
        this._bindSettingElements()
        this._bindNavigationElements()
        this._bindSearchElements()
        this._bindDisplayElements()
        this._bindOfflineElements()
        this._bindResetAppElements()
        this._bindAboutElements()
        this._bindMiscElements()
    }

    private _bindTabElements() {
        this.homeMenuElem = <HTMLInputElement>document.getElementById('homeMenu')
        this.tabMenuElems.push(this.homeMenuElem)
        this.homeTabElem = <HTMLDivElement>document.getElementById('homeTab')
        this.tabPageElems.push(this.homeTabElem)
        this.catalogMenuElem = <HTMLInputElement>document.getElementById('catalogMenu')
        this.tabMenuElems.push(this.catalogMenuElem)
        this.catalogTabElem = <HTMLDivElement>document.getElementById('catalogTab')
        this.tabPageElems.push(this.catalogTabElem)
        this.searchMenuElem = <HTMLInputElement>document.getElementById('searchMenu')
        this.tabMenuElems.push(this.searchMenuElem)
        this.searchTabElem = <HTMLDivElement>document.getElementById('searchTab')
        this.tabPageElems.push(this.searchTabElem)
        this.playlistMenuElem = <HTMLInputElement>document.getElementById('playlistMenu')
        this.tabMenuElems.push(this.playlistMenuElem)
        this.playlistTabElem = <HTMLDivElement>document.getElementById('playlistTab')
        this.tabPageElems.push(this.playlistTabElem)
        this.offlineMenuElem = <HTMLInputElement>document.getElementById('offlineMenu')
        this.tabMenuElems.push(this.offlineMenuElem)
        this.offlineTabElem = <HTMLDivElement>document.getElementById('offlineTab')
        this.tabPageElems.push(this.offlineTabElem)
    }

    private _bindSettingElements() {
        this.autoPlayElem = <HTMLInputElement>document.getElementById('autoPlay')
        this.playNextElem = <HTMLInputElement>document.getElementById('playNext')
        this.repeatElem = <HTMLInputElement>document.getElementById('repeat')
        this.loadAudioWithTextElem = <HTMLInputElement>document.getElementById('loadAudioWithText')
        this.showLineNumsElem = <HTMLInputElement>document.getElementById('showLineNums')

        this.darkThemeElem = <HTMLInputElement>document.getElementById('darkTheme')

        this.resetAppMenuElem = <HTMLAnchorElement>document.getElementById('resetAppMenu')
    }

    private _bindNavigationElements() {
        this.albumElem = <HTMLSelectElement>document.getElementById('album')
        this.trackElem = <HTMLSelectElement>document.getElementById('track')
        this.loadCatalogTrackElem = <HTMLButtonElement>document.getElementById('loadCatalogTrack')
        this.selectRandomElem = <HTMLButtonElement>document.getElementById('selectRandom')
        this.shareLinkElem = <HTMLButtonElement>document.getElementById('shareLink')
    }

    private _bindSearchElements() {
        this.searchForElem = <HTMLInputElement>document.getElementById('searchFor')
        this.searchResultsElem = <HTMLTextAreaElement>document.getElementById('searchResults')
        this.searchResultsLabelElem = <HTMLSpanElement>document.getElementById('searchResultsLabel')
        this.pauseSearchResultsElem = <HTMLInputElement>document.getElementById('pauseSearchResults')
        this.clearSearchResultsElem = <HTMLAnchorElement>document.getElementById('clearSearchResults')
        this.abortSearchElem = <HTMLAnchorElement>document.getElementById('abortSearch')

        this.searchScopeElem = <HTMLSelectElement>document.getElementById('searchScope')
        this.useRegExElem = <HTMLInputElement>document.getElementById('useRegEx')
        this.regExFlagsElem = <HTMLInputElement>document.getElementById('regExFlags')
        this.applyAndBetweenTermsElem = <HTMLInputElement>document.getElementById('applyAndBetweenTerms')
        this.ignoreDiacriticsElem = <HTMLInputElement>document.getElementById('ignoreDiacritics')
    }

    private _bindDisplayElements() {
        this.playingTrackElem = <HTMLElement>document.getElementById('playingTrack')
        this.audioPlayerElem = <HTMLAudioElement>document.getElementById('audioPlayer')
        this.displayingTrackElem = <HTMLElement>document.getElementById('displayingTrack')
        this.trackTextBodyElem = <HTMLDivElement>document.getElementById('trackTextBody')
        this.revealInCatElem = <HTMLAnchorElement>document.getElementById('revealInCat')
    }

    private _bindOfflineElements() {
        this.offlineAlbumTitleElem = <HTMLElement>document.getElementById('offlineAlbumTitle')
        this.offlineTrackTitleElem = <HTMLElement>document.getElementById('offlineTrackTitle')
        this.concurrencyCountElem = <HTMLSelectElement>document.getElementById('concurrencyCount')
        this.downloadAlbumElem = <HTMLInputElement>document.getElementById('downloadAlbum')
        this.deleteAlbumElem = <HTMLInputElement>document.getElementById('deleteAlbum')
        this.addTrackToCacheElem = <HTMLButtonElement>document.getElementById('addTrackToCache')
        this.removeTrackFromCacheElem = <HTMLButtonElement>document.getElementById('removeTrackFromCache')
        this.processingInfoElem = <HTMLDivElement>document.getElementById('processingInfo')
        this.processingProgressElem = <HTMLProgressElement>document.getElementById('processingProgress')
    }

    private _bindResetAppElements() {
        this.resetAppDialogElem = <HTMLDialogElement>document.getElementById('resetAppDialog')
        this.resetAppCloseElem = <HTMLAnchorElement>document.getElementById('resetAppClose')
        this.resetAppConfirmElem = <HTMLAnchorElement>document.getElementById('resetAppConfirm')
    }

    private _bindAboutElements() {
        this.aboutMenuElem = <HTMLAnchorElement>document.getElementById('aboutMenu')
        this.aboutDialogElem = <HTMLDialogElement>document.getElementById('aboutDialog')
        this.aboutDialogCloseElem = <HTMLAnchorElement>document.getElementById('aboutDialogClose')
        this.aboutTextBodyElem = <HTMLDivElement>document.getElementById('aboutTextBody')
    }

    private _bindMiscElements() {
        this.ctxMenuToggleIconElem = document.getElementById('ctxMenuToggleIcon')
        this.ctxMenuToggleElem = <HTMLButtonElement>document.getElementById('ctxMenuToggle')
        this.ctxMenuToggleElem.onclick = () => {
            const isOpen = this._isCtxMenuToggleOpen()
            if (isOpen)
                this.ctxMenuToggleIconElem.removeAttribute('color')
            else
                this.ctxMenuToggleIconElem.setAttribute('color', 'medium')
            this.showHideContextControls(!isOpen)

        }
        this.scrollTextWithAudioElem = <HTMLInputElement>document.getElementById('scrollTextWithAudio')
        this.skipAudioToLineElem = <HTMLAnchorElement>document.getElementById('skipAudioToLine')
        this.gotoTopElem = <HTMLAnchorElement>document.getElementById('gotoTop')
        this.tabSliderElem = <HTMLInputElement>document.getElementById('tabSlider')
        this.snackbarElem = <HTMLDivElement>document.getElementById('snackbar')
    }

    private _getAudioPositionAsPerc(): number {
        const audioCurr = this.audioPlayerElem.currentTime
        const audioTotal = this.audioPlayerElem.duration
        const audioPerc = audioCurr/audioTotal
        return 100 * audioPerc
    }

    private _charPosToLineNumPercOffset(idxPos: number): number[] {
        const ret = [1, 0]
        for (let i = 1; i < this._charPosLineIndex.length; i++) {
            if (idxPos >= this._charPosLineIndex[i-1] && idxPos < this._charPosLineIndex[i]) {
                ret[0] =  i
                const diff = idxPos - this._charPosLineIndex[i-1]
                const total = this._charPosLineIndex[i] - this._charPosLineIndex[i-1]
                ret[1] = diff/total
                break
            }
        }
        return ret
    } 
} 