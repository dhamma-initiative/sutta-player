import { SuttaPlayerView } from '../views/sutta-player-view.js'

import { AlbumPlayerState, BookmarkedSelection, TrackSelection } from '../models/album-player-state.js'
import { AlbumStorageQueryable } from "../models/album-storage-queryable.js"
import { AboutController } from './about-controller.js'
import { FabController } from './fab-controller.js'
import { OfflineController } from './offline-controller.js'
import { ResetAppController } from './resetapp-controller.js'
import { SearchController } from './search-controller.js'
import { SettingsController } from './settings-controller.js'

export class SuttaPlayerController {
    public static VERSION = "v1.0.11"

    _albumStore: AlbumStorageQueryable

    private _appRoot: string
    private _model: AlbumPlayerState
    private _view: SuttaPlayerView

    private _settingsController: SettingsController
    private _searchController: SearchController
    private _fabController: FabController

    private _offlineController: OfflineController
    private _resetAppController: ResetAppController
    private _aboutController: AboutController

    private _lastScrollTime = 0
    private _lineSelectionCb = (event: MouseEvent) => {
        this._onLineSelected(event)
    }

    public constructor(appRoot: string, albumStorage: AlbumStorageQueryable) {
        this._appRoot = appRoot
        this._albumStore = albumStorage

        const bookmark = new BookmarkedSelection(appRoot)
        this._model = new AlbumPlayerState(bookmark)
        this._view = new SuttaPlayerView(this._model, this._albumStore)

        this._settingsController = new SettingsController(this._model, this._view, this)
        this._searchController = new SearchController(this._model, this._view, this)
        this._fabController = new FabController(this._model, this._view, this)
        this._offlineController = new OfflineController(this._model, this._view, this)
        this._resetAppController = new ResetAppController(this._model, this._view, this)
        this._aboutController = new AboutController(this._model, this._view, this)
    }

    public async setup() {
        this._injectVersionInfo()
        this._model.restore()
        await this._loadShareLinkIfSpecified()
        if (this._model.navSel.baseRef === null)
            await this._model.navSel.updateBaseRef(this._albumStore)
        await this._view.initialise(this._lineSelectionCb)
		this._registerListeners()
        await this._settingsController.setup()
        await this._searchController.setup()
        await this._fabController.setup()
        await this._offlineController.setup()
        await this._resetAppController.setup()
        await this._aboutController.setup()
    }

    public async tearDown() {
        let settingsSaveModel = await this._settingsController.tearDown()
        let srchSaveModel = await this._searchController.tearDown()
        let fabSaveModel = await this._fabController.tearDown()
        let offlineSaveModel = await this._offlineController.tearDown()
        let resetAppSaveModel = await this._resetAppController.tearDown()
        let aboutSaveModel = await this._aboutController.tearDown()
        if (settingsSaveModel && srchSaveModel && fabSaveModel && offlineSaveModel && resetAppSaveModel && aboutSaveModel)
            this._model.save()
        this._albumStore.close()
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
        this._registerNavigationListeners()
        this._registerDisplayListeners()
    }

    private _registerNavigationListeners() {
        this._view.albumElem.onchange = async () => {
            if (this._view.albumElem.selectedIndex !== this._model.navSel.albumIndex)
                await this._onAlbumSelected(null)
        }
        // this._view.trackElem.onclick = async () => {
        //     await this._onTrackSelected(null)
        // }
        this._view.trackElem.onchange = async () => {
            await this._onTrackSelected(null)
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
        this._view.shareLinkElem.onclick = async (e: Event) => {
            e.preventDefault()
            this._onShareLink()
        }
    }

    private _registerDisplayListeners() {
        this._view.audioPlayerElem.onloadedmetadata = async () => {
            this._model.audioState = 2
            if (!isNaN(this._view.audioPlayerElem.duration)) 
                this._fabController.notifyDuration(this._view.audioPlayerElem.duration)
            this._view.ctxPlayToggleElem.disabled = true
        }
        this._view.audioPlayerElem.onloadeddata = async () => {
            this._model.audioState = 3
            this._view.updatePlayingTrackInfo(this._model.audioSel.baseRef, 'loaded')
            this._view.ctxPlayToggleElem.disabled = false
        }
        this._view.audioPlayerElem.onplay = async () => {
            this._model.audioState = 4
            this._view.updatePlayingTrackInfo(this._model.audioSel.baseRef, 'playing')
            this._lastScrollTime = 0
            this._view.ctxPlayToggleElem.checked = true
        }
        this._view.audioPlayerElem.onpause = async () => {
            this._model.audioState = 5
            this._view.updatePlayingTrackInfo(this._model.audioSel.baseRef, 'paused')
            this._view.ctxPlayToggleElem.checked = false
            this._model.bookmarkSel.cancelAwaitingAudioEndIfRqd()
        }
        this._view.audioPlayerElem.onended = async () => {
            this._model.audioState = 6
            this._view.ctxPlayToggleElem.checked = false
            this._model.bookmarkSel.cancelAwaitingAudioEndIfRqd()
            await this._onAudioEnded()
        }
        this._view.audioPlayerElem.ontimeupdate = async () => {
            const diff = this._view.audioPlayerElem.currentTime - this._lastScrollTime  
            if (Math.abs(diff) > 5) {  
                this._lastScrollTime = this._view.audioPlayerElem.currentTime
                this._view.syncTextPositionWithAudio()
            }
            this._model.currentTime = this._view.audioPlayerElem.currentTime
            if (this._model.bookmarkSel.isAwaitingAudioEnd()) {
                if (this._model.currentTime >= this._model.bookmarkSel.endTime) {
                    this._model.bookmarkSel.cancelAwaitingAudioEndIfRqd()
                    this._view.audioPlayerElem.pause()
                }
            }
        }
        this._view.linkNavToAudioElem.onclick = async (event: Event) => {
            event.preventDefault()
            await this._onLoadIntoNavSelector(this._model.audioSel)
            this.showUserMessage(`Navigation selection sync'd to ${this._model.audioSel.baseRef}`)
        }
        this._view.linkNavToTextElem.onclick = async (event: Event) => {
            event.preventDefault()
            await this._onLoadIntoNavSelector(this._model.textSel)
            this.showUserMessage(`Navigation selection sync'd to ${this._model.textSel.baseRef}`)
        }
    }

    private async _onAudioEnded() {
        this._view.updatePlayingTrackInfo(this._model.audioSel.baseRef, 'played')
        if (this._model.playNext) {
            window.scroll(0, 0)
            const fileList = await this._albumStore.queryTrackReferences(this._model.audioSel.albumIndex)
            if (this._model.audioSel.trackIndex < fileList.length-1) {
                this._model.audioSel.trackIndex++
                this._model.audioSel.isLoaded = false
                await this._model.audioSel.updateBaseRef(this._albumStore)
                await this._onLoadAudio(this._model.audioSel)
            }
        }
    }

    private async _onAlbumSelected(forceAlbIdx: number) {
        this._model.navSel.albumIndex = (forceAlbIdx === null) ? Number(this._view.albumElem.value) : forceAlbIdx
        this._model.navSel.trackIndex = 0
        this._view.trackElem.selectedIndex = this._model.navSel.trackIndex
        await this._model.navSel.updateBaseRef(this._albumStore)
        await this._view.refreshTrackSelectionList()
    }

    private async _onTrackSelected(forceTrackIdx: number) {
        this._model.navSel.trackIndex = (forceTrackIdx === null) ?  Number(this._view.trackElem.value) : forceTrackIdx
        await this._model.navSel.updateBaseRef(this._albumStore)
    }

    async _onLoadAudio(srcSel: TrackSelection): Promise<boolean> {
        if (this._model.audioSel.isSimilar(srcSel) && this._model.audioSel.isLoaded)
            return true
        this._model.currentTime = 0
        this._model.audioState = -1
        this._model.audioSel.read(srcSel)
        this._model.bookmarkSel.read(srcSel)
        if (this._model.linkTextToAudio) 
            await this._onLoadText(this._model.audioSel)
        await this._view.loadTrackAudio()
        return false
    }

    async _onLoadText(srcSel: TrackSelection): Promise<boolean> {
        if (this._model.textSel.isSimilar(srcSel) && this._model.textSel.isLoaded)
            return true
        this._model.bookmarkSel.read(srcSel)
        this._view.refreshSkipAudioToLine()
        this._model.textSel.read(srcSel)
        await this._view.loadTrackTextForUi(this._lineSelectionCb)
        return false
    }

    private _onLineSelected(event: MouseEvent) {
        const elem = <HTMLElement> event.target
        const lineNum = this._view.parseLineNumber(elem.id)
        if (!lineNum)
            return
        const lineRef = this._view.createLineRefValues(lineNum)
        const lineRefVals = AlbumPlayerState.fromLineRef(lineRef)
        const textLen = elem.textContent.length
        const rect = elem.getBoundingClientRect()
        const percDiff = lineRefVals[4] - lineRefVals[2]
        const adjPx = event.clientY - rect.top
        const adjChars = Math.floor((adjPx / rect.height) * textLen)
        const adjPercDiff = Math.floor((adjPx / rect.height) * percDiff)
        lineRefVals[1] = lineRefVals[1] + adjChars
        lineRefVals[2] = lineRefVals[2] + adjPercDiff
        let modLineRef = AlbumPlayerState.toLineRefUsingArr(lineRefVals)
        this._model.bookmarkSel.set(null, null, modLineRef)
        this._view.refreshSkipAudioToLine()
        this.showUserMessage(`Bookmarked line ${lineNum}`)
    }

    private async _onLoadRandom() {
        this._model.navSel.albumIndex = Math.round(Math.random() * this._view.albumElem.length)
        const fileList = await this._albumStore.queryTrackReferences(this._model.navSel.albumIndex)
        this._model.navSel.trackIndex = Math.round(Math.random() * fileList.length)
        await this._model.navSel.updateBaseRef(this._albumStore)
        if (this._view.albumElem.selectedIndex !== this._model.navSel.albumIndex) {
            this._view.albumElem.selectedIndex = this._model.navSel.albumIndex
            await this._view.refreshTrackSelectionList()
        }
        this._view.trackElem.selectedIndex = this._model.navSel.trackIndex
        await this._onLoadText(this._model.navSel)
        await this._onLoadAudio(this._model.navSel)
    }

    private _onShareLink() {
        let href = this._model.bookmarkSel.createLink()
        navigator.clipboard.writeText(href)
        this.showUserMessage('Share Link copied to clipboard')
    }

    async _onLoadIntoNavSelector(srcSel: TrackSelection) {
        this._model.navSel.read(srcSel)
        if (this._view.albumElem.selectedIndex !== this._model.navSel.albumIndex) {
            this._view.albumElem.selectedIndex = this._model.navSel.albumIndex
            await this._view.refreshTrackSelectionList()
        }
        this._view.trackElem.selectedIndex = this._model.navSel.trackIndex
        this.showUserMessage('Track loaded into Navigator selection')
    }

    private async _loadShareLinkIfSpecified() {
        await this._model.bookmarkSel.parseLink(this._albumStore)
        if (this._model.bookmarkSel.isAwaitingLoad()) {
            this._model.navSel.read(this._model.bookmarkSel)
            this._model.audioSel.read(this._model.bookmarkSel)
            this._model.textSel.read(this._model.bookmarkSel)
            if (this._model.bookmarkSel.startTime > -1)
                this._model.currentTime = this._model.bookmarkSel.startTime
            this._view.refreshSkipAudioToLine()
            this._view.albumTrackSelectionElem.open = false
        }
    }
} 