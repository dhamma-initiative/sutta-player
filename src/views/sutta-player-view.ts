import { AudioStorageQueryable } from '../models/audio-storage-queryable.js'
import { AlbumPlayerState, BookmarkedSelection, TrackSelection } from '../models/album-player-state.js'
import { AlbumStorageQueryable } from "../models/album-storage-queryable.js"
import { ViewControllable } from './view-controllable.js'

export class SuttaPlayerView {
    public static LINEID_PREFIX = '_ln_'
    // settings
    autoPlayElem: HTMLInputElement
    playNextElem: HTMLInputElement
    repeatElem: HTMLInputElement
    linkTextToAudioElem: HTMLInputElement
    showLineNumsElem: HTMLInputElement
    searchScopeElem: HTMLSelectElement
    darkThemeElem: HTMLInputElement
    showContextControlsElem: HTMLInputElement

    useRegExElem: HTMLInputElement
    ignoreDiacriticsElem: HTMLInputElement
    offlineMenuElem: HTMLAnchorElement
    resetAppMenuElem: HTMLAnchorElement

    // about
    aboutMenuElem: HTMLAnchorElement
    aboutDialogElem: HTMLDialogElement
    aboutDialogCloseElem: HTMLAnchorElement
    aboutTextBodyElem: HTMLParagraphElement

    // selections
    albumTrackSelectionElem: HTMLDetailsElement
    albumElem: HTMLSelectElement
    trackElem: HTMLSelectElement
    loadAudioElem: HTMLButtonElement
    loadTextElem: HTMLButtonElement
    loadRandomElem: HTMLButtonElement
    shareLinkElem: HTMLButtonElement

    // search
    searchForElem: HTMLInputElement
    searchSectionElem: HTMLDetailsElement
    searchSectionLabelElem: HTMLSpanElement
    pauseSearchResultsElem: HTMLInputElement
    clearSearchResultsElem: HTMLAnchorElement
    searchResultsElem: HTMLTextAreaElement

    // display
    playingTrackElem: HTMLElement
    linkNavToAudioElem: HTMLAnchorElement
    audioPlayerElem: HTMLAudioElement

    displayingTrackElem: HTMLElement
    linkNavToTextElem: HTMLAnchorElement
    trackTextBodyElem: HTMLDivElement

    // offline
    offlineDialogElem: HTMLDialogElement
    offlineDialogCloseElem: HTMLAnchorElement
    offlineTitleElem: HTMLElement
    downloadAlbumElem: HTMLInputElement
    deleteAlbumElem: HTMLInputElement
    removeAudioFromCacheElem: HTMLButtonElement
    processingInfoElem: HTMLDivElement
    processingProgressElem: HTMLProgressElement

    // reset app
    resetAppDialogElem: HTMLDialogElement
    resetAppCloseElem: HTMLAnchorElement
    resetAppConfirmElem: HTMLAnchorElement

    snackbarElem: HTMLDivElement
    scrollPlayToggleElem: HTMLInputElement
    skipAudioToLineElem: HTMLAnchorElement
    scrollTextWithAudioElem: HTMLInputElement
    gotoTopElem: HTMLAnchorElement

    private _model: AlbumPlayerState
    private _albumStore: AlbumStorageQueryable
    private _audioStore: AudioStorageQueryable
    private _viewControllable: ViewControllable

    private _charPosLineIndex: number[] = []
    private _trackLov: string[]
    
    public removeFromCacheBaseRef: string = null

    constructor(mdl: AlbumPlayerState, albumStore: AlbumStorageQueryable, audioStore: AudioStorageQueryable, vc: ViewControllable) {
        this._model = mdl
        this._albumStore = albumStore
        this._audioStore = audioStore
        this._viewControllable = vc
        this._bindHtmlElements()
    }

    public async initialise(cb: (event: MouseEvent) => void) {
        this.loadAlbumsList()
        await this.loadTracksList()
        await this.loadTrackTextForUi(cb)
        this.refreshAudioControls()
        await this.loadTrackAudio()
        this._finaliseShareLinkLoadIfRqd()
    }

    public refreshAudioControls() {
        this.autoPlayElem.checked = this._model.autoPlay
        this.audioPlayerElem.autoplay = this._model.autoPlay
        this.playNextElem.checked = this._model.playNext
        this.repeatElem.checked = this._model.repeat
        this.audioPlayerElem.loop = this._model.repeat

        this.linkTextToAudioElem.checked = this._model.linkTextToAudio
        this.scrollTextWithAudioElem.checked = this._model.scrollTextWithAudio

        this.showLineNumsElem.checked = this._model.showLineNums
        this.darkThemeElem.checked = this._model.darkTheme
        this.showContextControlsElem.checked = this._model.showContextControls

        this.searchForElem.value = this._model.searchFor
        this.searchScopeElem.selectedIndex = this._model.searchScope
        this.useRegExElem.checked = this._model.useRegEx
        this.ignoreDiacriticsElem.checked = this._model.ignoreDiacritics
        
        this.processingProgressElem.value = 0

        this.setColorTheme()
        this.toggleLineNums()
        this.refreshSkipAudioToLine()
        this.showHideContextControls(this._model.showContextControls)
    }

    public async loadTracksList() {
        this._trackLov = this._albumStore.queryTrackReferences(this._model.navSel.albumIndex)
        this.trackElem.innerHTML = ''
        const albumRef: string = <string> this._model.navSel.dictionary['albumRef']
        for (let i = 0; i < this._trackLov.length; i++) {
            const baseRef = `${albumRef}/${this._trackLov[i]}`
            const isInTxtCache = await this._albumStore.isInCache(baseRef)
            const isInAudCache = await this._audioStore.isInCache(baseRef)
            const cachedChar = (isInAudCache && isInTxtCache) ? '✔️' : isInAudCache ? '🔊' : isInTxtCache ? '👀' : '◻'
            const option = document.createElement('option')
            option.value = `${i}`
            option.innerHTML = `${cachedChar} ${this._trackLov[i]}`
            this.trackElem.append(option)
        }
        this.trackElem.selectedIndex = this._model.navSel.trackIndex
        // this._viewControllable.finaliseTrackLov(this._trackLov)
    }

    public finaliseLoadTracksList(status: number[]) {
        for (let i = 0; i < status.length; i++) {
            const cachedChar = (status[i] === 3) ? '✔️' : (status[i] === 2) ? '🔊' : (status[i] === 1) ? '👀' : '◻'
            this.trackElem.children[i].innerHTML = `${cachedChar} ${this._trackLov[i]}`
        }
    }

    public async loadTrackWith(trackSel: TrackSelection): Promise<string> {
        if (trackSel.baseRef === null) 
            return null

        const ret = await this._albumStore.queryTrackText(trackSel.baseRef)
        trackSel.isLoaded = true
        return ret
    }

    public async loadTrackTextForUi(lineSelCb: (event: MouseEvent) => void) {
        if (this._model.textSel.baseRef === null) 
            return

        const textBody = await this.loadTrackWith(this._model.textSel)
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
        this.displayingTrackElem.innerHTML = `${this._model.textSel.baseRef}`
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
        if (this._model.audioSel.baseRef !== this._model.textSel.baseRef)
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

    public async loadTrackAudio() {
        const success = this.loadTrackAudioWith(this._model.audioSel, this.audioPlayerElem)
        if (success) {
            this.audioPlayerElem.currentTime = this._model.currentTime
            if (this._model.bookmarkSel.isAwaitingLoad()) {
                if (this._model.currentTime > -1) {
                    // Uncaught (in promise) DOMException: play() failed because the user didn't interact with the document first. 
                    // await this.audioPlayerElem.play()
                }
            }
        }
    }

    public loadTrackAudioWith(trackSel: TrackSelection, audioElem: HTMLAudioElement): boolean {
        if (trackSel.baseRef === null)
            return false
        this._model.audioState = 0
        const srcRef = this._audioStore.queryHtmlAudioSrcRef(trackSel.baseRef)
        audioElem.src = srcRef
        this._model.audioState = 1
        trackSel.isLoaded = true
        return true
    }

    public updatePlayingTrackInfo(baseRef: string, status: string) {
        const info = status ? ` [${status}]` : ''
        this.playingTrackElem.innerHTML = `${baseRef}${info}`
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

    public async toggleOfflineDialog(event: any) {
        if (event)
            event.preventDefault()
        this.offlineDialogElem.open = !this.offlineDialogElem.open
        if (!this.offlineDialogElem.open)
            return
        if (this._model.stopDwnlDel === 0) {
            const albumName = this.albumElem.children[this.albumElem.selectedIndex].textContent
            this.offlineTitleElem.textContent = albumName
        }
        const isCached = await this._audioStore.isInCache(this._model.navSel.baseRef)
        if (isCached) {
            this.removeFromCacheBaseRef = this._model.navSel.baseRef
            this.removeAudioFromCacheElem.style.display = "block"
            this.removeAudioFromCacheElem.innerHTML = `Remove ${this.removeFromCacheBaseRef} from cache`
        } else
            this.removeAudioFromCacheElem.style.display = "none"
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
        this.processingProgressElem.value = perc
    }

    public refreshSkipAudioToLine() {
        if (this._model.bookmarkSel.lineRef) {
            const vals = AlbumPlayerState.fromLineRef(this._model.bookmarkSel.lineRef)
            this.skipAudioToLineElem.innerHTML = `&nbsp;Line&nbsp;${vals[0]}&nbsp;⏫&nbsp;`
            this.skipAudioToLineElem.style.display = 'block'
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
        this.albumElem.selectedIndex = this._model.navSel.albumIndex
    }

    public showHideContextControls(show: boolean) {
        if (this._model.showContextControls)
            show = this._model.showContextControls
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

    private _bindHtmlElements() {
        this._bindSettingElements()
        this._bindNavigationElements()
        this._bindSearchElements()
        this._bindDisplayElements()
        this._bindOfflineElements()
        this._bindResetAppElements()
        this._bindAboutElements()
        this._bindMiscElements()
    }

    private _bindSettingElements() {
        this.autoPlayElem = <HTMLInputElement>document.getElementById('autoPlay')
        this.playNextElem = <HTMLInputElement>document.getElementById('playNext')
        this.repeatElem = <HTMLInputElement>document.getElementById('repeat')
        this.linkTextToAudioElem = <HTMLInputElement>document.getElementById('linkTextToAudio')
        this.showLineNumsElem = <HTMLInputElement>document.getElementById('showLineNums')
        this.searchScopeElem = <HTMLSelectElement>document.getElementById('searchScope')
        this.useRegExElem = <HTMLInputElement>document.getElementById('useRegEx')
        this.ignoreDiacriticsElem = <HTMLInputElement>document.getElementById('ignoreDiacritics')

        this.darkThemeElem = <HTMLInputElement>document.getElementById('darkTheme')
        this.showContextControlsElem = <HTMLInputElement>document.getElementById('showContextControls')

        this.offlineMenuElem = <HTMLAnchorElement>document.getElementById('offlineMenu')
        this.resetAppMenuElem = <HTMLAnchorElement>document.getElementById('resetAppMenu')
    }

    private _bindNavigationElements() {
        this.albumTrackSelectionElem = <HTMLDetailsElement>document.getElementById('albumTrackSelection')
        this.albumElem = <HTMLSelectElement>document.getElementById('album')
        this.trackElem = <HTMLSelectElement>document.getElementById('track')
        this.loadAudioElem = <HTMLButtonElement>document.getElementById('loadAudio')
        this.loadTextElem = <HTMLButtonElement>document.getElementById('loadText')
        this.loadRandomElem = <HTMLButtonElement>document.getElementById('loadRandom')
        this.shareLinkElem = <HTMLButtonElement>document.getElementById('shareLink')
    }

    private _bindSearchElements() {
        this.searchForElem = <HTMLInputElement>document.getElementById('searchFor')
        this.searchResultsElem = <HTMLTextAreaElement>document.getElementById('searchResults')
        this.searchSectionElem = <HTMLDetailsElement>document.getElementById('searchSection')
        this.searchSectionLabelElem = <HTMLSpanElement>document.getElementById('searchSectionLabel')
        this.pauseSearchResultsElem = <HTMLInputElement>document.getElementById('pauseSearchResults')
        this.clearSearchResultsElem = <HTMLAnchorElement>document.getElementById('clearSearchResults')
    }

    private _bindDisplayElements() {
        this.playingTrackElem = <HTMLElement>document.getElementById('playingTrack')
        this.audioPlayerElem = <HTMLAudioElement>document.getElementById('audioPlayer')
        this.linkNavToAudioElem = <HTMLAnchorElement>document.getElementById('linkNavToAudio')
        this.displayingTrackElem = <HTMLElement>document.getElementById('displayingTrack')
        this.trackTextBodyElem = <HTMLDivElement>document.getElementById('trackTextBody')
        this.linkNavToTextElem = <HTMLAnchorElement>document.getElementById('linkNavToText')
    }

    private _bindOfflineElements() {
        this.offlineDialogElem = <HTMLDialogElement>document.getElementById('offlineDialog')
        this.offlineDialogCloseElem = <HTMLAnchorElement>document.getElementById('offlineDialogClose')
        this.offlineTitleElem = <HTMLElement>document.getElementById('offlineTitle')
        this.downloadAlbumElem = <HTMLInputElement>document.getElementById('downloadAlbum')
        this.deleteAlbumElem = <HTMLInputElement>document.getElementById('deleteAlbum')
        this.removeAudioFromCacheElem = <HTMLButtonElement>document.getElementById('removeAudioFromCache')
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
        this.scrollPlayToggleElem = <HTMLInputElement>document.getElementById('scrollPlayToggle')
        this.scrollTextWithAudioElem = <HTMLInputElement>document.getElementById('scrollTextWithAudio')
        this.skipAudioToLineElem = <HTMLAnchorElement>document.getElementById('skipAudioToLine')
        this.gotoTopElem = <HTMLAnchorElement>document.getElementById('gotoTop')
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