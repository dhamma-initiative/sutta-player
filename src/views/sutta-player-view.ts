import { off } from 'process'
import { AudioStorageQueryable } from '../models/audio-storage-queryable.js'
import { SuttaPlayerState, TrackSelection } from '../models/sutta-player-state.js'
import { SuttaStorageQueryable } from "../models/sutta-storage-queryable.js"

export class SuttaPlayerView {
    public static LINEID_PREFIX = '_ln_'
    // settings
    autoPlayElem: HTMLInputElement
    playNextElem: HTMLInputElement
    repeatElem: HTMLInputElement
    linkTextToAudioElem: HTMLInputElement
    showLineNumsElem: HTMLInputElement
    darkThemeElem: HTMLInputElement
    searchAllAlbumsElem: HTMLInputElement
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
    searchForElem: HTMLInputElement
    searchSectionElem: HTMLDetailsElement
    searchResultsElem: HTMLSelectElement

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
    audioCacherElem: HTMLAudioElement

    // reset app
    resetAppDialogElem: HTMLDialogElement
    resetAppCloseElem: HTMLAnchorElement
    resetAppConfirmElem: HTMLAnchorElement

    snackbarElem: HTMLDivElement
    scrollPlayToggleElem: HTMLInputElement
    skipAudioToLineElem: HTMLAnchorElement
    scrollTextWithAudioElem: HTMLInputElement
    gotoTopElem: HTMLAnchorElement

    private _modelState: SuttaPlayerState
    private _suttaStore: SuttaStorageQueryable
    private _audioStore: AudioStorageQueryable

    private _charPosLineIndex: number[] = []

    constructor(mdl: SuttaPlayerState, store: SuttaStorageQueryable, audResolver: AudioStorageQueryable) {
        this._modelState = mdl
        this._suttaStore = store
        this._audioStore = audResolver
        this._bindHtmlElements()
    }

    public async initialise(cb: (event: MouseEvent) => void) {
        this._loadAlbumsList()
        this.loadTracksList()
        await this.loadTrackText(cb)
        this.refreshAudioControls()
        this.loadTrackAudio()
        if (this._modelState.bookmarkLineRef !== '') {
            const lineRefVals = SuttaPlayerState.fromLineRef(this._modelState.bookmarkLineRef)
            this.scrollToTextLineNumber(lineRefVals[0], lineRefVals[1])
        } else
            window.scroll(0, this._modelState.currentScrollY)
    }

    public refreshAudioControls() {
        this.autoPlayElem.checked = this._modelState.autoPlay
        this.audioPlayerElem.autoplay = this._modelState.autoPlay
        this.playNextElem.checked = this._modelState.playNext
        this.repeatElem.checked = this._modelState.repeat
        this.audioPlayerElem.loop = this._modelState.repeat

        this.linkTextToAudioElem.checked = this._modelState.linkTextToAudio
        this.scrollTextWithAudioElem.checked = this._modelState.scrollTextWithAudio

        this.showLineNumsElem.checked = this._modelState.showLineNums
        this.darkThemeElem.checked = this._modelState.darkTheme

        this.searchForElem.value = this._modelState.searchFor
        this.searchAllAlbumsElem.checked = this._modelState.searchAllAlbums
        this.useRegExElem.checked = this._modelState.useRegEx
        this.ignoreDiacriticsElem.checked = this._modelState.ignoreDiacritics
        
        this.processingProgressElem.value = 0

        this.setColorTheme()
        this.toggleLineNums()
        this.refreshSkipAudioToLine()
    }

    public loadTracksList() {
        const trackLov = this._suttaStore.queryTrackReferences(this._modelState.navSel.albumIndex)
        this.trackElem.innerHTML = ''
        for (let i = 0; i < trackLov.length; i++) {
            const option = document.createElement('option')
            option.value = `${i}`
            option.innerText = trackLov[i]
            this.trackElem.append(option)
        }
        this.trackElem.selectedIndex = this._modelState.navSel.trackIndex
    }

    public async loadTrackText(lineSelCb: (event: MouseEvent) => void) {
        if (this._modelState.textSel.baseRef === null) 
            return
        const textBody = await this._suttaStore.queryTrackText(this._modelState.textSel.baseRef)
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
        this.displayingTrackElem.innerHTML = `&#128064; ${this._modelState.textSel.baseRef}`
        this._modelState.textSel.isLoaded = true
    }

    public createLineRefValues(lineNum: number) {
        const totalCharLen = this._charPosLineIndex[this._charPosLineIndex.length-1] 
        const begIdxPos = this._charPosLineIndex[lineNum-1]
        const begPerc = ((begIdxPos/totalCharLen) * 100)
        const endIdxPos = this._charPosLineIndex[lineNum]
        const endPerc = ((endIdxPos/totalCharLen) * 100)
        const ret = SuttaPlayerState.toLineRef(lineNum, begIdxPos, begPerc, endIdxPos, endPerc)
        return ret
    }

    public setColorTheme() {
        const theme: string = this._modelState.darkTheme ? 'dark' : 'light'
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
        this._modelState.currentTime = seekTo
        this.audioPlayerElem.currentTime = this._modelState.currentTime
    }

    public syncTextPositionWithAudio() {
        if (!this._modelState.scrollTextWithAudio)
            return
        if (this._modelState.audioSel.baseRef !== this._modelState.textSel.baseRef)
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

    public loadTrackAudio() {
        const success = this.loadSuttaAudioWith(this._modelState.audioSel, this.audioPlayerElem)
        if (success)
            this.audioPlayerElem.currentTime = this._modelState.currentTime
    }

    public loadSuttaAudioWith(trackSel: TrackSelection, audioElem: HTMLAudioElement): boolean {
        if (trackSel.baseRef === null)
            return false
        this._modelState.audioState = 0
        const srcRef = this._audioStore.queryHtmlAudioSrcRef(trackSel.baseRef)
        audioElem.src = srcRef
        this._modelState.audioState = 1
        trackSel.isLoaded = true
        return true
    }

    public updatePlayingTrackInfo(baseRef: string, status: string) {
        const info = status ? ` [${status}]` : ''
        this.playingTrackElem.innerHTML = `&#9835; ${baseRef}${info}`
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
            let textBody = await this._suttaStore.readTextFile('./README.md')
            textBody = textBody.replaceAll('###', '-')
            textBody = textBody.replaceAll('#', '')
            this.aboutTextBodyElem.textContent = textBody + 'suttaplayer@gmail.com'
        } else
            this.aboutTextBodyElem.textContent = ''
        this.aboutDialogElem.open = !this.aboutDialogElem.open
    }

    public toggleOfflineDialog(event: any) {
        if (event)
            event.preventDefault()
        this.offlineDialogElem.open = !this.offlineDialogElem.open
        if (!this.offlineDialogElem.open)
            return
        if (this._modelState.stopDwnlDel === 0) {
            const albumName = this.albumElem.children[this.albumElem.selectedIndex].textContent
            this.offlineTitleElem.textContent = albumName
        }
        if (this._modelState.audioState === 1) { // stuck in assigned state
            this.removeAudioFromCacheElem.style.display = "block"
            this.removeAudioFromCacheElem.innerHTML = `Remove ${this._modelState.audioSel.baseRef} from cache`
        } else
            this.removeAudioFromCacheElem.style.display = "none"
    }

    public toggleResetAppDialog(event: any) {
        if (event)
            event.preventDefault()
        this.resetAppDialogElem.open = !this.resetAppDialogElem.open
    }

    public updateOfflineInfo(processingInfo: string, perc: number) {
        let actn = 'Choose an action above'
        let disableActivityActions = true
        if (this._modelState.stopDwnlDel === 1)
            actn = 'Downloading'
        else if (this._modelState.stopDwnlDel === 2)
            actn = 'Deleting'
        else if (this._modelState.stopDwnlDel === 0 && processingInfo === '' && perc === 0)
            disableActivityActions = false
        this.processingInfoElem.textContent = `${actn} ${processingInfo}`
        this.processingProgressElem.value = perc
        this.downloadAlbumElem.disabled = disableActivityActions
        this.deleteAlbumElem.disabled = disableActivityActions
    }

    public refreshSkipAudioToLine() {
        if (this._modelState.bookmarkLineRef !== '') {
            const vals = SuttaPlayerState.fromLineRef(this._modelState.bookmarkLineRef)
            this.skipAudioToLineElem.innerHTML = `Line ${vals[0]} &#9193; &#9835;`
            this.skipAudioToLineElem.style.display = 'block'
        } else
            this.skipAudioToLineElem.style.display = 'none'
    }

    private _loadAlbumsList() {
        const colLov = this._suttaStore.queryAlbumNames() 
        for (let i = 0; i < colLov.length; i++) {
            const option = document.createElement('option')
            option.value = `${i}`
            option.innerText = colLov[i]
            this.albumElem.append(option)
        }
        this.albumElem.selectedIndex = this._modelState.navSel.albumIndex
    }

    private _bindHtmlElements() {
        this._bindSettingElements()
        this._bindNavigationElements()
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
        this.darkThemeElem = <HTMLInputElement>document.getElementById('darkTheme')
        this.searchAllAlbumsElem = <HTMLInputElement>document.getElementById('searchAllAlbums')
        this.useRegExElem = <HTMLInputElement>document.getElementById('useRegEx')
        this.ignoreDiacriticsElem = <HTMLInputElement>document.getElementById('ignoreDiacritics')

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
        this.searchForElem = <HTMLInputElement>document.getElementById('searchFor')
        this.searchSectionElem = <HTMLDetailsElement>document.getElementById('searchSection')
        this.searchResultsElem = <HTMLSelectElement>document.getElementById('searchResults')
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
        this.audioCacherElem = <HTMLAudioElement>document.getElementById('audioCacher')
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