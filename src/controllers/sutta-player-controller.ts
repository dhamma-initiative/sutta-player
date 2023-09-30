import { SuttaPlayerView } from '../views/sutta-player-view.js'

import { AlbumPlayerState, BookmarkedSelection, TrackSelection } from '../models/album-player-state.js'
import { AlbumStorageQueryable } from "../models/album-storage-queryable.js"
import { AboutController } from './about-controller.js'
import { FabController } from './fab-controller.js'
import { OfflineController } from './offline-controller.js'
import { ResetAppController } from './resetapp-controller.js'
import { SearchController } from './search-controller.js'
import { SettingsController } from './settings-controller.js'
import { DeferredPromise } from '../runtime/deferred-promise.js'

export class SuttaPlayerController {
    public static VERSION = "v1.0.12"

    _albumStore: AlbumStorageQueryable
    private _model: AlbumPlayerState
    private _view: SuttaPlayerView

    private _appRoot: string

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

    tabSelectedIndex: number = -1
    private _tabWndScrollPosMap = new Map<number, number>()
    private _onTabEnter: (tabNum: number) => void
    private _onTabExit: (tabNum: number) => void

    audDurWait: DeferredPromise<number>
    audDurWaitState: number

    public constructor(appRoot: string, albumStorage: AlbumStorageQueryable) {
        this._appRoot = appRoot
        this._albumStore = albumStorage

        this.audDurWait = new DeferredPromise<number>()
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
        if (this._model.catSel.baseRef === null)
            await this._model.catSel.updateBaseRef(this._albumStore)
        await this._view.initialise(this._lineSelectionCb)
		this._registerListeners()
        this.openTab(0)
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
        this._tabWndScrollPosMap.clear()
        this._albumStore.close()
        this._view = null
        this._model = null
    }

    public createAudDurWait() {
        this.audDurWait = new DeferredPromise<number>()
        this.audDurWaitState = 0    // pending
        this.audDurWait.then(() => this.audDurWaitState = 1, () => this.audDurWaitState = -1)
    }

    public showUserMessage(msg: string, dur?: number) {
        this._view.showMessage(msg, dur)
    }

    public openTab(tabNum: number) {
        if (tabNum === this.tabSelectedIndex)
            return
        if (this.tabSelectedIndex > -1) {
            this._tabWndScrollPosMap.set(this.tabSelectedIndex, window.scrollY)
            if (this._onTabExit)
                this._onTabExit(this.tabSelectedIndex)
        }
        const prevTabNum = this.tabSelectedIndex
        this.tabSelectedIndex = tabNum
        this._view.openTab(tabNum, prevTabNum)
        if (this.tabSelectedIndex > -1) {
            let wndScrollY = this._tabWndScrollPosMap.get(tabNum)
            if (wndScrollY)
                window.scroll(0, wndScrollY)
            if (this._onTabEnter)
                this._onTabEnter(this.tabSelectedIndex)
        }
        this._view.tabMenuElems[tabNum].checked = true
        this._view.tabSliderElem.value = `${tabNum}`
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
        // this._view.homeMenuElem.onchange = 
        let mainMenuOnChangeListener = (e: Event) => {
            const el = <HTMLInputElement> e.target
            const tabIdx = parseInt(el.value)
            this.openTab(tabIdx) 
        }
        for (let i = 0; i < this._view.tabMenuElems.length; i++) 
            this._view.tabMenuElems[i].onchange = mainMenuOnChangeListener

        this._view.albumElem.onchange = async () => {
            if (this._view.albumElem.selectedIndex !== this._model.catSel.albumIndex)
                await this._onAlbumSelected(null)
        }
        this._view.trackElem.onchange = async () => {
            await this._onTrackSelected(null)
        }
        this._view.loadCatalogTrackElem.onclick = async () => {
            await this._onLoadTrack(this._model.catSel)
        }
        this._view.selectRandomElem.onclick = async () => {
            await this._onSelectRandom()
        }
        this._view.shareLinkElem.onclick = async (e: Event) => {
            e.preventDefault()
            this._onShareLink()
        }
    }

    private _registerDisplayListeners() {
        this._view.audioPlayerElem.ondurationchange = async () => {
            if (!isNaN(this._view.audioPlayerElem.duration))
                this.audDurWait.resolve(this._view.audioPlayerElem.duration)
        }
        this._view.audioPlayerElem.onloadedmetadata = async () => {
            this._model.setAudioState(2)
            // if (!isNaN(this._view.audioPlayerElem.duration)) 
            //     this._fabController.notifyDuration(this._view.audioPlayerElem.duration)
        }
        this._view.audioPlayerElem.onloadeddata = async () => {
            this._model.setAudioState(3)
            this._view.updatePlayingTrackInfo(this._model.homeSel.baseRef, 'audio loaded')
        }
        this._view.audioPlayerElem.onplay = async () => {
            this._model.setAudioState(4)
            this._view.updatePlayingTrackInfo(this._model.homeSel.baseRef, 'audio playing')
            this._lastScrollTime = 0
        }
        this._view.audioPlayerElem.onpause = async () => {
            this._model.setAudioState(5)
            this._view.updatePlayingTrackInfo(this._model.homeSel.baseRef, 'audio paused')
            this._model.bookmarkSel.cancelAwaitingAudioEndIfRqd()
        }
        this._view.audioPlayerElem.onended = async () => {
            this._model.setAudioState(6)
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
        this._view.revealInCatElem.onclick = async (event: Event) => {
            event.preventDefault()
            await this._onRevealInCatalog(this._model.homeSel)
            this.openTab(1)
        }
    }

    private async _onAudioEnded() {
        this._view.updatePlayingTrackInfo(this._model.homeSel.baseRef, 'played')
        if (this._model.playNext) {
            window.scroll(0, 0)
            const fileList = await this._albumStore.queryTrackReferences(this._model.homeSel.albumIndex)
            if (this._model.homeSel.trackIndex < fileList.length-1) {
                this._model.homeSel.trackIndex++
                this._model.homeSel.isLoaded = false
                await this._model.homeSel.updateBaseRef(this._albumStore)
                this._onLoadTrack(this._model.homeSel)
            }
        }
    }

    private async _onAlbumSelected(forceAlbIdx: number) {
        this._model.catSel.albumIndex = (forceAlbIdx === null) ? Number(this._view.albumElem.value) : forceAlbIdx
        this._model.catSel.trackIndex = 0
        this._view.trackElem.selectedIndex = this._model.catSel.trackIndex
        await this._model.catSel.updateBaseRef(this._albumStore)
        await this._view.refreshTrackSelectionList()
    }

    private async _onTrackSelected(forceTrackIdx: number) {
        this._model.catSel.trackIndex = (forceTrackIdx === null) ?  Number(this._view.trackElem.value) : forceTrackIdx
        await this._model.catSel.updateBaseRef(this._albumStore)
    }

    async _onLoadAudio(srcSel: TrackSelection): Promise<void> {
        this._model.currentTime = 0
        this._model.homeSel.read(srcSel)
        this._model.bookmarkSel.read(srcSel)
        const isNewAwaitDurRqd = [false]
        await this._view.loadTrackAudio(isNewAwaitDurRqd)
        if (isNewAwaitDurRqd[0])
            this.createAudDurWait()
    }

    async _onLoadTrack(srcSel: TrackSelection): Promise<boolean> {
        this.openTab(0)
        if (this._model.homeSel.isSimilar(srcSel) && this._model.homeSel.isLoaded)
            return true
        this._model.bookmarkSel.read(srcSel)
        this._view.refreshSkipAudioToLine()
        this._model.homeSel.read(srcSel)
        await this._view.loadTrackTextForUi(this._lineSelectionCb)
        if (this._model.loadAudioWithText) 
            await this._onLoadAudio(srcSel)
        return false
    }

    private _onLineSelected(event: MouseEvent) {
        const elem = <HTMLElement> event.target
        const lineNum = this._view.parseLineNumber(elem.id)
        if (!lineNum)
            return
        this._model.bookmarkSel.read(this._model.homeSel)
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

    private async _onSelectRandom() {
        this._model.catSel.albumIndex = Math.round(Math.random() * this._view.albumElem.length)
        const fileList = await this._albumStore.queryTrackReferences(this._model.catSel.albumIndex)
        this._model.catSel.trackIndex = Math.round(Math.random() * fileList.length)
        await this._model.catSel.updateBaseRef(this._albumStore)
        if (this._view.albumElem.selectedIndex !== this._model.catSel.albumIndex) {
            this._view.albumElem.selectedIndex = this._model.catSel.albumIndex
            await this._view.refreshTrackSelectionList()
        }
        this._view.trackElem.selectedIndex = this._model.catSel.trackIndex
    }

    private _onShareLink() {
        let href = this._model.bookmarkSel.createLink()
        navigator.clipboard.writeText(href)
        this.showUserMessage('Share Link copied to clipboard')
    }

    async _onRevealInCatalog(srcSel: TrackSelection) {
        this._model.catSel.read(srcSel)
        if (this._view.albumElem.selectedIndex !== this._model.catSel.albumIndex) {
            this._view.albumElem.selectedIndex = this._model.catSel.albumIndex
            await this._view.refreshTrackSelectionList()
        }
        this._view.trackElem.selectedIndex = this._model.catSel.trackIndex
        this.showUserMessage('Track revealed into catalog')
    }

    private async _loadShareLinkIfSpecified() {
        await this._model.bookmarkSel.parseLink(this._albumStore)
        if (this._model.bookmarkSel.isAwaitingLoad()) {
            this._model.catSel.read(this._model.bookmarkSel)
            this._model.homeSel.read(this._model.bookmarkSel)
            this._model.homeSel.read(this._model.bookmarkSel)
            if (this._model.bookmarkSel.startTime > -1)
                this._model.currentTime = this._model.bookmarkSel.startTime
            this._view.refreshSkipAudioToLine()
        }
    }
}