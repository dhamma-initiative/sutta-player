import { SuttaPlayerView } from '../views/sutta-player-view.js'

import { AudioStorageQueryable } from '../models/audio-storage-queryable.js'
import { SuttaPlayerState, TrackSelection } from '../models/sutta-player-state.js'
import { SuttaStorageQueryable } from "../models/sutta-storage-queryable.js"
import { CacheUtils } from '../runtime/cache-utils.js'
import { DeferredPromise } from '../runtime/deferred-promise.js'
import { SearchController } from './search-controller.js'

type OfflineProcessingCallback = (currTrack: TrackSelection) => Promise<boolean>

export class SuttaPlayerController {
    public static VERSION = "v1.0.3"

    _audioStore: AudioStorageQueryable
    _suttaStore: SuttaStorageQueryable

    private _appRoot: string
    private _model: SuttaPlayerState
    private _view: SuttaPlayerView
    private _searchController: SearchController

    private _resetApp = false 
    private _downloadedPromise: DeferredPromise<boolean>
    private _audDurPromise: DeferredPromise<number>

    private _lastScrollTime = 0
    private _lineSelectionCb = (event: MouseEvent) => {
        this._onLineSelected(event)
    }

    public constructor(appRoot: string, suttaStorage: SuttaStorageQueryable, audioStorage: AudioStorageQueryable) {
        this._appRoot = appRoot
        this._suttaStore = suttaStorage
        this._audioStore = audioStorage
        this._model = new SuttaPlayerState()
        this._view = new SuttaPlayerView(this._model, this._suttaStore, this._audioStore)
        this._searchController = new SearchController(this._model, this._view, this)
    }

    public async setup() {
        this._injectVersionInfo()
        this._model.restore()
        this._loadShareLinkIfSpecified()
        if (this._model.navSel.baseRef === null)
            this._model.navSel.updateBaseRef(this._suttaStore)
        await this._view.initialise(this._lineSelectionCb)
		this._registerListeners()
        await this._searchController.setup()
    }

    public async tearDown() {
        await this._searchController.tearDown()
        if (!this._resetApp)
            this._model.save()
        this._view = null
        this._model = null
    }

    public showUserMessage(msg: string, dur?: number) {
        this._view.showMessage(msg, dur)
    }

    private _injectVersionInfo() {
        const htmlVerTxt = document.getElementById('appHtmlViewVer').textContent
        document.getElementById('appJsCtrlVer').textContent = SuttaPlayerController.VERSION
        console.log(`App HTML View version: ${htmlVerTxt}`)
        console.log(`App JS Controller version: ${SuttaPlayerController.VERSION}`)
    }

    private _registerListeners() {
        this._registerSettingsListeners()
        this._registerNavigationListeners()
        this._registerNavSearchListeners()
        this._registerAboutListeners()
        this._registerDisplayListeners()
        this._registerOfflineListeners()
        this._registerResetAppListeners()
        this._registerMiscListeners()
    }

    private _registerSettingsListeners() {
        this._view.autoPlayElem.onchange = async () => {
            this._model.autoPlay = this._view.autoPlayElem.checked
            this._view.refreshAudioControls()
        }
        this._view.playNextElem.onchange = async () => {
            this._model.playNext = this._view.playNextElem.checked
            if (this._model.playNext)
                this._model.repeat = false
            this._view.refreshAudioControls()
        }
        this._view.repeatElem.onchange = async () => {
            this._model.repeat = this._view.repeatElem.checked
            if (this._model.repeat)
                this._model.playNext = false
            this._view.refreshAudioControls()
        }
        this._view.linkTextToAudioElem.onchange = async () => {
            this._model.linkTextToAudio = this._view.linkTextToAudioElem.checked
            if (this._model.linkTextToAudio)
                await this._onLoadText(this._model.audioSel)
        }
        this._view.showLineNumsElem.onchange = async () => {
            this._model.showLineNums = this._view.showLineNumsElem.checked
            this._view.toggleLineNums()
        }
        this._view.searchAllAlbumsElem.onchange = async () => {
            this._model.searchAllAlbums = this._view.searchAllAlbumsElem.checked
        }
        this._view.useRegExElem.onchange = async () => {
            this._model.useRegEx = this._view.useRegExElem.checked
        }
        this._view.ignoreDiacriticsElem.onchange = async () => {
            this._model.ignoreDiacritics = this._view.ignoreDiacriticsElem.checked
        }
        this._view.darkThemeElem.onchange = async () => {
            this._model.darkTheme = this._view.darkThemeElem.checked
            this._view.setColorTheme()
        }
    }

    private _registerNavigationListeners() {
        this._view.albumElem.onchange = async () => {
            if (this._view.albumElem.selectedIndex !== this._model.navSel.albumIndex)
                this._onAlbumSelected(null)
        }
        this._view.trackElem.onclick = async () => {
            this._onTrackSelected(null)
        }
        this._view.loadAudioElem.onclick = async () => {
            await this._onLoadAudio(this._model.navSel)
        }
        this._view.loadTextElem.onclick = async () => {
            await this._onLoadText(this._model.navSel)
        }
        this._view.loadRandomElem.onclick = async () => {
            await this._onLoadRandom()
        }
        this._view.shareLinkElem.onclick = async () => {
            this._onShareLink(this._model.navSel)
        }
    }

    private _registerNavSearchListeners() {
        this._view.searchResultsElem.onclick = async (e: Event) => {
            await this._onSearchResultSelected()
        }
        const searchResultsSummaryElem = document.getElementById('searchResultSummary')
        const searchFormElem = <HTMLFormElement> this._view.searchForElem.parentElement
        searchFormElem.onsubmit = async (e: Event) => {
            e.preventDefault()
            await this._onSearchFor(searchResultsSummaryElem)
        }
    }

    private async _onSearchFor(searchResultsSummaryElem: HTMLElement) {
        this._model.startSearch = !this._model.startSearch
        searchResultsSummaryElem.setAttribute('aria-busy', String(this._model.startSearch))
        if (this._model.startSearch) {
            await this._searchController.onStartSearch()
            this._model.startSearch = false
        }
        searchResultsSummaryElem.setAttribute('aria-busy', String(this._model.startSearch))
    }

    private async _onSearchResultSelected() {
        const rsltSel = this._getSearchResultSelection()
        this._onLoadIntoNavSelector(rsltSel)
        await this._onLoadAudio(rsltSel)
        this._view.audioPlayerElem.pause()
        if (!this._model.linkTextToAudio)
            await this._onLoadText(rsltSel)
        const lineChars = SuttaPlayerState.fromLineRef(rsltSel.context)
        this._view.scrollToTextLineNumber(lineChars[0], lineChars[1])
        this._model.bookmarkLineRef = rsltSel.context
        this._view.refreshSkipAudioToLine()
        this.showUserMessage(`Loading match on line ${lineChars[0]} of ${rsltSel.baseRef}`)
    }

    private _getSearchResultSelection(): TrackSelection {
        const opt = <HTMLOptionElement> this._view.searchResultsElem.selectedOptions[0]
        const baseRef = (<HTMLOptGroupElement> opt.parentElement).label
        const ret = this._suttaStore.queryTrackSelection(baseRef)
        ret.context = this._view.searchResultsElem.value
        return ret
    }

    private _registerDisplayListeners() {
        this._view.audioPlayerElem.onloadedmetadata = async () => {
            this._model.audioState = 2
            if (!isNaN(this._view.audioPlayerElem.duration)) {
                if (this._audDurPromise)
                    this._audDurPromise.resolve(this._view.audioPlayerElem.duration)
            }
            this._view.scrollPlayToggleElem.disabled = true
        }
        this._view.audioPlayerElem.onloadeddata = async () => {
            this._model.audioState = 3
            this._view.updatePlayingTrackInfo(this._model.audioSel.baseRef, 'loaded')
            this._view.scrollPlayToggleElem.disabled = false
        }
        this._view.audioPlayerElem.onplay = async () => {
            this._model.audioState = 4
            this._view.updatePlayingTrackInfo(this._model.audioSel.baseRef, 'playing')
            this._lastScrollTime = 0
            this._view.scrollPlayToggleElem.checked = true
        }
        this._view.audioPlayerElem.onpause = async () => {
            this._model.audioState = 5
            this._view.updatePlayingTrackInfo(this._model.audioSel.baseRef, 'paused')
            this._view.scrollPlayToggleElem.checked = false
        }
        this._view.audioPlayerElem.onended = async () => {
            this._model.audioState = 6
            this._view.scrollPlayToggleElem.checked = false
            await this._onAudioEnded()
        }
        this._view.audioPlayerElem.ontimeupdate = async () => {
            const diff = this._view.audioPlayerElem.currentTime - this._lastScrollTime  
            if (Math.abs(diff) > 5) {  
                this._lastScrollTime = this._view.audioPlayerElem.currentTime
                this._view.syncTextPositionWithAudio()
            }
            this._model.currentTime = this._view.audioPlayerElem.currentTime
        }
        this._view.linkNavToAudioElem.onclick = async (event: Event) => {
            event.preventDefault()
            this._onLoadIntoNavSelector(this._model.audioSel)
            this.showUserMessage(`Navigation selection sync'd to ${this._model.audioSel.baseRef}`)
        }
        this._view.linkNavToTextElem.onclick = async (event: Event) => {
            event.preventDefault()
            this._onLoadIntoNavSelector(this._model.textSel)
            this.showUserMessage(`Navigation selection sync'd to ${this._model.textSel.baseRef}`)
        }
    }

    private _registerOfflineListeners() {
        this._view.offlineMenuElem.onclick = async (event) => {
            this._view.toggleOfflineDialog(event)
        }
        this._view.offlineDialogCloseElem.onclick = this._view.offlineMenuElem.onclick
        this._view.downloadAlbumElem.onchange = async () => {
            if (this._view.downloadAlbumElem.checked) {
                this._model.stopDwnlDel = 1
                this._prepareOfflineControls([false, true], [null, null])
                await this._onDownloadAlbum()
                this._prepareOfflineControls([false, false], [false, null])
            } else {
                this._model.stopDwnlDel = 0
                if (this._downloadedPromise !== null)
                    this._downloadedPromise.resolve(false)
                this._prepareOfflineControls([false, false], [null, null])
            }
        }
        this._view.deleteAlbumElem.onchange = async () => {
            if (this._view.deleteAlbumElem.checked) {
                this._model.stopDwnlDel = 2
                this._view.downloadAlbumElem.disabled = true
                this._prepareOfflineControls([true, false], [null, null])
                await this._onRemoveAlbum()
                this._prepareOfflineControls([false, false], [null, false])
            } else {
                this._model.stopDwnlDel = 0
                this._prepareOfflineControls([false, false], [null, null])
            }
        }
        this._view.audioCacherElem.oncanplaythrough = async () => {
            this._downloadedPromise.resolve(true)
        }
        this._view.removeAudioFromCacheElem.onclick = async () => {
            if (this._model.audioState === 1) { // stuck in assigned state
                const deleted = await this._audioStore.removeFromCache(this._model.audioSel.baseRef)
                if (deleted)
                    this._view.removeAudioFromCacheElem.style.display = "none"
            }
        }
    }

    private _prepareOfflineControls(dwnDelDisable: boolean[], dwnDelChecked: boolean[]) {
        this._view.downloadAlbumElem.disabled = dwnDelDisable[0]
        this._view.deleteAlbumElem.disabled = dwnDelDisable[1]
        if (dwnDelChecked[0] !== null)
            this._view.downloadAlbumElem.checked = dwnDelChecked[0]
        if (dwnDelChecked[1] !== null)
            this._view.deleteAlbumElem.checked = dwnDelChecked[1]
    }

    private _registerResetAppListeners() {
        this._view.resetAppMenuElem.onclick = async (event) => {
            this._view.toggleResetAppDialog(event)
        }
        this._view.resetAppCloseElem.onclick = this._view.resetAppMenuElem.onclick
        this._view.resetAppConfirmElem.onclick = async (event) => {
            await this._onResetAppConfirm()
            this._view.toggleResetAppDialog(event)
        }
    }

    private _registerAboutListeners() {
        this._view.aboutMenuElem.onclick = async (event) => {
            await this._view.toggleAboutInfo(event)
        }
        this._view.aboutDialogCloseElem.onclick = this._view.aboutMenuElem.onclick
    }

    private _registerMiscListeners() {
        this._view.scrollPlayToggleElem.onchange = async () => {
            if (this._view.scrollPlayToggleElem.checked)
                await this._view.audioPlayerElem.play()
            else
                this._view.audioPlayerElem.pause()
        }
        this._view.skipAudioToLineElem.onclick = async (event: Event) => {
            event.preventDefault()
            await this._onSkipAudioToLine()
        }
        this._view.scrollTextWithAudioElem.onchange = async () => {
            this._model.scrollTextWithAudio = this._view.scrollTextWithAudioElem.checked
        }
        this._view.gotoTopElem.onclick = async () => {
            window.scroll(0, 0)
        }
        const fabSection = document.getElementById('fabSection')
        window.onscroll = () => {
            if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
                fabSection.style.display = "block"
            } else {
                fabSection.style.display = "none"
            }
        }
    }

    private async _onSkipAudioToLine() {
        if (this._model.bookmarkLineRef === "")
            return
        const currBookmarkLineRef = this._model.bookmarkLineRef
        const lineRefVals = SuttaPlayerState.fromLineRef(this._model.bookmarkLineRef)
        this._onLoadIntoNavSelector(this._model.textSel)
        this._audDurPromise = new DeferredPromise<number>()
        const alreadyLoaded = await this._onLoadAudio(this._model.textSel)
        if (alreadyLoaded)
            this._audDurPromise.resolve(this._view.audioPlayerElem.duration)
        this._model.bookmarkLineRef = currBookmarkLineRef
        this._view.refreshSkipAudioToLine()
        await this._managePromisedDuration(lineRefVals)
        await this._view.audioPlayerElem.play()
    }

    private async _managePromisedDuration(lineRefVals: number[]) {
        const timeOut = new Promise<number>((res, rej) => {
            setTimeout(() => {
                if (this._audDurPromise !== null)
                    res(-1)
            }, 10000)   // 10 sec
        })
        const audDur = await Promise.race([this._audDurPromise, timeOut])
        this._audDurPromise = null
        if (audDur === -1) {
            const deleted = await this._audioStore.removeFromCache(this._model.audioSel.baseRef)
            if (deleted)
                this.showUserMessage(`Partial cache removed. Please try reloading...`)
        } else
            this._view.seekToTimePosition(lineRefVals[1], lineRefVals[2], audDur)
    }

    private async _onAudioEnded() {
        this._view.updatePlayingTrackInfo(this._model.audioSel.baseRef, 'played')
        if (this._model.playNext) {
            window.scroll(0, 0)
            const fileList = this._suttaStore.queryTrackReferences(this._model.audioSel.albumIndex)
            if (this._model.audioSel.trackIndex < fileList.length-1) {
                this._model.audioSel.trackIndex++
                this._model.audioSel.updateBaseRef(this._suttaStore)
                await this._onLoadAudio(this._model.audioSel)
            }
        }
    }

    private _onAlbumSelected(forceAlbIdx: number) {
        this._model.navSel.albumIndex = (forceAlbIdx === null) ? Number(this._view.albumElem.value) : forceAlbIdx
        this._model.navSel.trackIndex = 0
        this._view.trackElem.selectedIndex = this._model.navSel.trackIndex
        this._model.navSel.updateBaseRef(this._suttaStore)
        this._view.loadTracksList()
    }

    private _onTrackSelected(forceTrackIdx: number) {
        this._model.navSel.trackIndex = (forceTrackIdx === null) ?  Number(this._view.trackElem.value) : forceTrackIdx
        this._model.navSel.updateBaseRef(this._suttaStore)
    }

    private async _onLoadAudio(srcSel: TrackSelection): Promise<boolean> {
        if (this._model.audioSel.isSimilar(srcSel) && this._model.audioSel.isLoaded)
            return true
        this._model.currentTime = 0
        this._model.audioState = -1
        this._model.audioSel.read(srcSel)
        this._view.loadTrackAudio()
        if (this._model.linkTextToAudio) 
            await this._onLoadText(this._model.audioSel)
        return false
    }

    private async _onLoadText(srcSel: TrackSelection): Promise<boolean> {
        if (this._model.textSel.isSimilar(srcSel) && this._model.textSel.isLoaded)
            return true
        this._model.bookmarkLineRef = ''  // clear bookmark
        this._view.refreshSkipAudioToLine()
        this._model.textSel.read(srcSel)
        await this._view.loadTrackText(this._lineSelectionCb)
        return false
    }

    private _onLineSelected(event: MouseEvent) {
        const elem = <HTMLElement> event.target
        const lineNum = this._view.parseLineNumber(elem.id)
        if (!lineNum)
            return
        const lineRef = this._view.createLineRefValues(lineNum)
        const lineRefVals = SuttaPlayerState.fromLineRef(lineRef)
        const textLen = elem.textContent.length
        const rect = elem.getBoundingClientRect()
        const percDiff = lineRefVals[4] - lineRefVals[2]
        const adjPx = event.clientY - rect.top
        const adjChars = Math.floor((adjPx / rect.height) * textLen)
        const adjPercDiff = Math.floor((adjPx / rect.height) * percDiff)
        lineRefVals[1] = lineRefVals[1] + adjChars
        lineRefVals[2] = lineRefVals[2] + adjPercDiff
        this._model.bookmarkLineRef = SuttaPlayerState.toLineRefUsingArr(lineRefVals)
        this._view.refreshSkipAudioToLine()
        this.showUserMessage(`Bookmarked line ${lineNum}`)
    }

    private async _onLoadRandom() {
        this._model.navSel.albumIndex = Math.round(Math.random() * this._view.albumElem.length)
        const fileList = this._suttaStore.queryTrackReferences(this._model.navSel.albumIndex)
        this._model.navSel.trackIndex = Math.round(Math.random() * fileList.length)
        this._model.navSel.updateBaseRef(this._suttaStore)
        if (this._view.albumElem.selectedIndex !== this._model.navSel.albumIndex) {
            this._view.albumElem.selectedIndex = this._model.navSel.albumIndex
            this._view.loadTracksList()
        }
        this._view.trackElem.selectedIndex = this._model.navSel.trackIndex
        await this._onLoadAudio(this._model.navSel)
        await this._onLoadText(this._model.navSel)
    }

    private async _onDownloadAlbum() {
        const downloadHandler: OfflineProcessingCallback = async (currTrack: TrackSelection) =>  {
            this._downloadedPromise = new DeferredPromise<boolean>()
            this._view.loadSuttaAudioWith(currTrack, this._view.audioCacherElem)
            const wasDownloaded = await this._downloadedPromise
            return wasDownloaded
        }
        await this._onOfflineAlbumProcessing(downloadHandler, 'Downloaded')
    }

    private async _onRemoveAlbum() {
        const removeHandler: OfflineProcessingCallback = async (currTrack: TrackSelection) =>  {
            const wasDeleted = await this._audioStore.removeFromCache(currTrack.baseRef)
            return wasDeleted
        }
        await this._onOfflineAlbumProcessing(removeHandler, 'Removed')
    }

    private async _onOfflineAlbumProcessing(handler: OfflineProcessingCallback, msgType: string) {
        this._view.offlineMenuElem.setAttribute('aria-busy', String(true))
        const processSel = new TrackSelection('cache')
        processSel.albumIndex = this._model.navSel.albumIndex
        const fileList = this._suttaStore.queryTrackReferences(this._model.navSel.albumIndex)
        const urls: string[] = []
        for (let i = 0; i < fileList.length; i++) {
            const progVal = Math.round(((i+1)/fileList.length) * 100)
            processSel.trackIndex = i
            processSel.updateBaseRef(this._suttaStore)
            this._view.updateOfflineInfo(processSel.baseRef, progVal)
            const wasProcessed = await handler(processSel)
            console.log(`Processed: ${processSel.baseRef}: ${wasProcessed}`)
            if (this._model.stopDwnlDel === 0)
                break
        }
        this._view.offlineMenuElem.setAttribute('aria-busy', String(false))
        if (this._model.stopDwnlDel !== 0) {
            this._view.updateOfflineInfo('Finished', 0)
            if (!this._view.offlineDialogElem.open)
                this.showUserMessage(msgType + ' Album')
        } else {
            this._view.updateOfflineInfo('Cancelled', 0)
            if (!this._view.offlineDialogElem.open)
                this.showUserMessage('Cancelled Album Processing')
        }
        this._model.stopDwnlDel = 0
    }

    private async _onResetAppConfirm() {
        this._resetApp = true
        localStorage.clear()
        const keys = await caches.keys()
        for (let i = 0; i < keys.length; i++) 
            await caches.delete(keys[i])      
        if (CacheUtils.ENABLE_CACHE) {
            const swReg = await navigator.serviceWorker.getRegistration()
            await swReg.unregister()
        }
        window.location.reload()
    }

    private _onShareLink(srcSel: TrackSelection) {
        let baseRefHref = location.protocol + '//' + location.host + this._appRoot
        baseRefHref += '#' + srcSel.baseRef + `?startTime=${this._model.currentTime}`
        if (this._model.bookmarkLineRef !== '')
            baseRefHref += `&line=${this._model.bookmarkLineRef}`
        navigator.clipboard.writeText(baseRefHref)
        this.showUserMessage('Share Link copied to clipboard')
    }

    private _onLoadIntoNavSelector(srcSel: TrackSelection) {
        this._model.navSel.read(srcSel)
        if (this._view.albumElem.selectedIndex !== this._model.navSel.albumIndex) {
            this._view.albumElem.selectedIndex = this._model.navSel.albumIndex
            this._view.loadTracksList()
        }
        this._view.trackElem.selectedIndex = this._model.navSel.trackIndex
        this.showUserMessage('Track loaded into Navigator selection')
    }

    private _loadShareLinkIfSpecified() {
        let href = location.href
        let url = new URL(href)
        if (url.hash) {
            href = href.replace('#','')
            url = new URL(href)
           let baseRef = url.pathname.substring(this._appRoot.length)
            if (baseRef.startsWith('/'))
                baseRef = baseRef.substring(1)
            const urlSel = this._suttaStore.queryTrackSelection(baseRef)
            if (urlSel.albumIndex > -1 && urlSel.trackIndex > -1) {
                this._model.navSel.read(urlSel)
                this._model.audioSel.read(urlSel)
                this._model.textSel.read(urlSel)
                this._model.currentTime = Number(url.searchParams.get('startTime'))
                this._model.bookmarkLineRef = url.searchParams.get('line')
                this._view.refreshSkipAudioToLine()
                this._view.albumTrackSelectionElem.open = false
            }
        }
    }
} 