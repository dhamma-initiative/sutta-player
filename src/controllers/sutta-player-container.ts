import { AlbumPlayerState, BookmarkedSelection, PlaylistIterator, TrackSelection } from '../models/album-player-state.js'
import { AlbumStorageQueryable } from "../models/album-storage-queryable.js"
import { DeferredPromise } from '../runtime/deferred-promise.js'
import { BaseController, BaseView } from './base-controller.js'
import { CatalogPlaylistIterator, CatalogTabPageController, CatalogTabPageView } from './catalog-tab-page-controller.js'
import { HomePageTabController, HomeTabPageView } from './home-tab-page-controller.js'
import { MainMenuController, MainMenuView } from './main-menu-controller.js'
import { TabPageController, TabPageView } from './tab-page-controller.js'

export class SuttaPlayerContainer<V extends SuttaPlayerFabView<any>> extends BaseController<V> {
    public static VERSION = "v1.0.13"

    albumStore: AlbumStorageQueryable

    mainMenuController: MainMenuController<MainMenuView<any>>
    homePageTabController: HomePageTabController<HomeTabPageView<any>>
    catalogTabPageController: CatalogTabPageController<CatalogTabPageView<any>>

    tabPageList: TabPageController<TabPageView<any>>[] =[]
    controllerList: BaseController<BaseView<any>>[] = []
    tabContextMenuMap = new Map<number, HTMLElement>()
    tabSelectedIndex: number = -1

    private _tabWndScrollPosMap = new Map<number, number>()
    private _playlistIteratorMap = new Map<string, PlaylistIterator>()

    private appRoot: string
    private _lastScrollTime = 0
    audDurationWait = new DeferredPromise<number>()
    audDurationWaitState: number

    public constructor(appRoot: string, albumStorage: AlbumStorageQueryable) {
        const bookmark = new BookmarkedSelection(appRoot)
        const model = new AlbumPlayerState(bookmark)
        super(model, null)
        this.container = this
        this.appRoot = appRoot
        this.albumStore = albumStorage
    }

    protected async _createView() {
        this.view = new SuttaPlayerFabView(this) as V
    }

    public async setup() {
        this._injectVersionInfo()
        this.model.restore()
        await super.setup()

        this.mainMenuController = new MainMenuController(this.model, this)
        this.homePageTabController = new HomePageTabController(this.model, this)
        this.catalogTabPageController = new CatalogTabPageController(this.model, this)

        for (let i = 0; i < this.controllerList.length; i++) 
            await this.controllerList[i].setup()
        this.openTab(0)
        this._preparePlaylistIterator()
    }

    public async tearDown() {
        this.albumStore.close()
        this.model.save()
        for (let i = 0; i < this.controllerList.length; i++) 
            await this.controllerList[i].tearDown()
        this._playlistIteratorMap.clear()
        this._tabWndScrollPosMap.clear()
        this.view = null
        this.model = null
    }

    public registerController(ctrl: BaseController<BaseView<any>>) {
        if (ctrl === this)
            return
        this.controllerList.push(ctrl)
        if (ctrl instanceof TabPageController) {
            this.tabPageList[ctrl.getIndex()] = ctrl
            const ctxMenuId = ctrl.getCtxMenuElementId()
            const ctxMenu = document.getElementById(ctxMenuId)
            if (ctxMenu) {
                this.tabContextMenuMap.set(ctrl.getIndex(), ctxMenu)
                this.view.moveToTabContextMenu(ctxMenu)
            }
        }
    }

    public registerIterator(key: string, itr: PlaylistIterator) {
        this._playlistIteratorMap.set(key, itr)
    }

    public openTab(tabNum: number) {
        if (tabNum === this.tabSelectedIndex)
            return
        if (this.tabSelectedIndex > -1) {
            this._tabWndScrollPosMap.set(this.tabSelectedIndex, window.scrollY)
            this.tabPageList[this.tabSelectedIndex].onExit()
        }
        this.tabSelectedIndex = tabNum
        if (this.tabSelectedIndex > -1) {
            let wndScrollY = this._tabWndScrollPosMap.get(tabNum)
            if (wndScrollY)
                window.scroll(0, wndScrollY)
            this.tabPageList[this.tabSelectedIndex].onEnter()
        }
        this.mainMenuController.view.viewMenuOptions[tabNum].checked = true
        this.view.tabSliderElem.value = `${tabNum}`
    }

    public showUserMessage(msg: string, dur?: number) {
        this.view.showMessage(msg, dur)
    }

    private _injectVersionInfo() {
        const htmlVerTxt = document.getElementById('appHtmlViewVer').textContent
        document.getElementById('appJsCtrlVer').textContent = SuttaPlayerContainer.VERSION
        console.log(`App HTML View version: ${htmlVerTxt}`)
        console.log(`App JS Controller version: ${SuttaPlayerContainer.VERSION}`)
    }

    protected async _registerListeners() {
        this._registerContextMenuListners()
        this._registerNavigationListeners()
        this._registerAudioPlayerListeners()
    }

    private _registerContextMenuListners() {
        this.view.ctxMenuToggleElem.onclick = () => {
            const isOpen = this.view.isCtxMenuToggleOpen()
            if (isOpen)
                this.view.ctxMenuToggleIconElem.removeAttribute('color')
            else
                this.view.ctxMenuToggleIconElem.setAttribute('color', 'medium')
            this.view.showHideContextControls(!isOpen)
        }
        this.view.shareLinkElem.onclick = async (e: Event) => {
            e.preventDefault()
            this._onShareLink()
        }
        this._registerPreviousNextListeners()
        this._registerSkipBackForwardListeners()
        this._registerBookmarkListeners()
    }

    private _registerPreviousNextListeners() {
        this.view.previousTrackElem.onclick = async (e: Event) => {
            if (this.model.playlistIterator) {
                if (await this.model.playlistIterator.prev())
                    await this._loadTrack(this.model.playlistIterator.current())
            }
        }
        this.view.nextTrackElem.onclick = async (e: Event) => {
            if (this.model.playlistIterator) {
                if (await this.model.playlistIterator.next())
                    await this._loadTrack(this.model.playlistIterator.current())
            }
        }
    }

    private _registerSkipBackForwardListeners() {
        this.view.skipsFwd5SecElem.onclick = async (e: Event) => {
            e.preventDefault()
            if (this.model.getAudioState() > 1)
                this.view.audioPlayerElem.currentTime += 5
        }
        this.view.skipsBack5SecElem.onclick = async (e: Event) => {
            e.preventDefault()
            if (this.model.getAudioState() > 1)
                this.view.audioPlayerElem.currentTime -= 5
        }
    }

    private _registerBookmarkListeners() {
        this.view.setStartAtBookmarkElem.onclick = async (e: Event) => {
            e.preventDefault()
            if (this.model.getAudioState() > 1) {
                this.model.bookmarkSel.read(this.model.homeSel)
                this.model.bookmarkSel.setDetails(null, this.view.audioPlayerElem.currentTime, null)
                this.container.showUserMessage('Bookmarked audio start')
            }
        }
        this.view.setStopAtBookmarkElem.onclick = async (e: Event) => {
            e.preventDefault()
            if (this.model.getAudioState() > 1) {
                this.model.bookmarkSel.read(this.model.homeSel)
                this.model.bookmarkSel.setDetails(null, null, this.view.audioPlayerElem.currentTime)
                this.container.showUserMessage('Bookmarked audio end')
            }
        }
        this.view.clearBookmarkPositionsElem.onclick = async (e: Event) => {
            e.preventDefault()
            this.model.bookmarkSel.setDetails(null, -1, -1)
            this.container.showUserMessage('Cleared bookmark text & audio positions')
        }
    }

    private _registerNavigationListeners() {
        this.view.gotoTopElem.onclick = async () => {
            window.scroll(0, 0)
        }
        this.view.tabSliderElem.onchange = async () => {
            this.openTab(parseInt(this.view.tabSliderElem.value))
        }
    }

    private _registerAudioPlayerListeners() {
        this.view.audioPlayerElem.ondurationchange = async (e) => {
            if (!isNaN(this.view.audioPlayerElem.duration))
                this.audDurationWait.resolve(this.view.audioPlayerElem.duration)
        }
        this.view.audioPlayerElem.onloadedmetadata = async (e) => {
            this.model.setAudioState(2)
        }
        this.view.audioPlayerElem.onloadeddata = async (e) => {
            this.model.setAudioState(3)
            this.view.updatePlayingTrackInfo(this.model.homeSel.baseRef, 'audio loaded')
        }
        this.view.audioPlayerElem.onplay = async (e) => {
            this.model.setAudioState(4)
            this.view.updatePlayingTrackInfo(this.model.homeSel.baseRef, 'audio playing')
            this._lastScrollTime = 0
        }
        this.view.audioPlayerElem.onpause = async (e) => {
            this.model.setAudioState(5)
            this.view.updatePlayingTrackInfo(this.model.homeSel.baseRef, 'audio paused')
            this.model.bookmarkSel.cancelAwaitingAudioEndIfRqd()
        }
        this.view.audioPlayerElem.onended = async (e) => {
            this.model.setAudioState(6)
            this.model.bookmarkSel.cancelAwaitingAudioEndIfRqd()
            await this._onAudioEnded()
        }
        this.view.audioPlayerElem.ontimeupdate = async (e) => {
            const diff = this.view.audioPlayerElem.currentTime - this._lastScrollTime  
            if (Math.abs(diff) > 5) {  
                this._lastScrollTime = this.view.audioPlayerElem.currentTime
                this.homePageTabController.view.syncTextPositionWithAudio()
            }
            this.model.currentTime = this.view.audioPlayerElem.currentTime
            if (this.model.homeSel.stopTime !== null && this.model.currentTime > this.model.homeSel.stopTime) {
                e.preventDefault()
                this.view.audioPlayerElem.pause()
                await this._onAudioEnded()
            } else if (this.model.bookmarkSel.isAwaitingAudioEnd()) {
                if (this.model.currentTime >= this.model.bookmarkSel.stopTime) {
                    this.model.bookmarkSel.cancelAwaitingAudioEndIfRqd()
                    this.view.audioPlayerElem.pause()
                }
            }
        }
    }

    private async _onAudioEnded() {
        this.view.updatePlayingTrackInfo(this.model.homeSel.baseRef, 'played')
        if (this.model.playNext) {
            if (this.model.playlistIterator) {
                if (await this.model.playlistIterator.next()) {
                    await this._loadTrack(this.model.playlistIterator.current())
                }
            }
        }
    }

    async _loadTrack(srcSel: TrackSelection): Promise<boolean> {
        this.openTab(0)
        if (this.model.homeSel.isSimilar(srcSel) && this.model.homeSel.isLoaded)
            return true
        this.model.bookmarkSel.read(srcSel)
        this.homePageTabController.view.refreshSkipAudioToLine()
        this.model.homeSel.read(srcSel)
        await this.homePageTabController.loadTrackText()
        if (this.model.loadAudioWithText) 
            await this._onLoadAudio(srcSel)
        return false
    }
    
    async _onLoadAudio(srcSel: TrackSelection): Promise<void> {
        this.model.currentTime = srcSel.startTime ? srcSel.startTime : 0
        this.model.homeSel.read(srcSel)
        this.model.bookmarkSel.read(srcSel)
        const isNewAwaitDurRqd = [false]
        await this.view.loadTrackAudio(isNewAwaitDurRqd)
        if (isNewAwaitDurRqd[0])
            this.createAudioDurationWait()
    }
    
    public createAudioDurationWait() {
        this.audDurationWait = new DeferredPromise<number>()
        this.audDurationWaitState = 0    // pending
        this.audDurationWait.then(() => this.audDurationWaitState = 1, () => this.audDurationWaitState = -1)
    }

    public async getAudioPositionAsPerc(): Promise<number> {
        const audioCurr = this.view.audioPlayerElem.currentTime
        const audioTotal = await this.audDurationWait // should be same as this.audioPlayerElem.duration
        const audioPerc = audioCurr/audioTotal
        return 100 * audioPerc
    }

    private _onShareLink() {
        let href = this.model.bookmarkSel.createLink()
        navigator.clipboard.writeText(href)
        let msg = 'Share Link copied to clipboard'
        let desc = ""
        if (this.model.bookmarkSel.baseRef)
            desc += `sutta ${this.model.bookmarkSel.baseRef}<br/>`
        if (this.model.bookmarkSel.lineRef)
            desc += `line ⓘ ${this.model.bookmarkSel.lineRef}<br/>`
        if (this.model.bookmarkSel.startTime > -1)
            desc += `audio ▶️ ${this.model.bookmarkSel.startTime}<br/>`
        if (this.model.bookmarkSel.stopTime > -1)
            desc += `audio ⏹️ ${this.model.bookmarkSel.stopTime}`
        if (desc.length > 0)
            msg = `<p>${msg}</p><p>${desc}</p>`
        this.container.showUserMessage(msg)
    }

    private _preparePlaylistIterator() {
        this.model.playlistIterator = this._playlistIteratorMap.get(this.model.lastPlaylistIterator)
        this.model.playlistIterator.setContext(this.model.homeSel)
    }
}

export class SuttaPlayerFabView<C extends SuttaPlayerContainer<SuttaPlayerFabView<C>>> extends BaseView<C> {
    audioPlayerElem = <HTMLAudioElement>document.getElementById('audioPlayer')
    previousTrackElem = <HTMLAnchorElement>document.getElementById('previousTrack')
    skipsBack5SecElem = <HTMLAnchorElement>document.getElementById('skipsBack5Sec')
    skipsFwd5SecElem = <HTMLAnchorElement>document.getElementById('skipsFwd5Sec')
    nextTrackElem = <HTMLAnchorElement>document.getElementById('nextTrack')
    setStartAtBookmarkElem = <HTMLAnchorElement>document.getElementById('setStartAtBookmark')
    setStopAtBookmarkElem = <HTMLAnchorElement>document.getElementById('setStopAtBookmark')
    clearBookmarkPositionsElem = <HTMLAnchorElement>document.getElementById('clearBookmarkPositions')
    shareLinkElem = <HTMLButtonElement>document.getElementById('shareLink')

    gotoTopElem = <HTMLAnchorElement>document.getElementById('gotoTop')
    tabSliderElem = <HTMLInputElement>document.getElementById('tabSlider')
    snackbarElem = <HTMLDivElement>document.getElementById('snackbar')

    ctxMenuToggleIconElem = document.getElementById('ctxMenuToggleIcon')
    ctxMenuToggleElem = <HTMLButtonElement>document.getElementById('ctxMenuToggle')
    lhsFabSectionElem = <HTMLDivElement>document.getElementById('lhsFabSection')

    public async bind() {
        const isNewAwaitDurRqd = [false]
        await this.loadTrackAudio(isNewAwaitDurRqd)
        this._finaliseShareLinkLoadIfRqd()
    }

    public async refresh() {
        this.audioPlayerElem.autoplay = this.controller.model.autoPlay
        this.audioPlayerElem.loop = this.controller.model.repeat
        this.showHideContextControls(this.isCtxMenuToggleOpen())
    }
    
    public showMessage(msg: string, dur = 3000) {
        this.snackbarElem.innerHTML = msg
        this.snackbarElem.classList.add('show')
        setTimeout(() => {
            this.snackbarElem.classList.remove('show')
        }, dur)
    }

    public showHideContextControls(show: boolean) {
        const dispStyle = show ? 'block' : 'none'
        const sections = ['lhsFabSection', 'centreFabSection', 'rhsFabSectionAudio', 'rhsFabSection']
        for (let i = 0; i < sections.length; i++) {
            const elem = document.getElementById(sections[i])
            elem.style.display = dispStyle
        }
    }

    public isCtxMenuToggleOpen(): boolean {
        let colorVal = this.ctxMenuToggleIconElem.getAttribute('color')
        return colorVal !== null
    }

    public async loadTrackAudio(isNewAwaitDurRqd: boolean[]): Promise<boolean> {
        const success = await this.loadTrackAudioWith(this.controller.model.homeSel, this.audioPlayerElem, isNewAwaitDurRqd)
        if (success) {
            this.audioPlayerElem.currentTime = this.controller.model.currentTime
            if (this.controller.model.bookmarkSel.isAwaitingLoad()) {
                if (this.controller.model.currentTime > -1) {
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
        const srcRef = this.controller.albumStore.queryTrackHtmlAudioSrcRef(trackSel.baseRef)
        if (srcRef === audioElem.src && this.controller.model.getAudioState() >= 1)
            return true
        this.controller.model.setAudioState(0)
        audioElem.src = srcRef
        isNewAwaitDurRqd[0] = true
        this.controller.model.setAudioState(1)
        trackSel.isLoaded = true
        return true
    }

    public moveToTabContextMenu(tabCtxMenuElem: HTMLElement) {
        this.lhsFabSectionElem.append(tabCtxMenuElem)
    }

    public updatePlayingTrackInfo(baseRef: string, status: string) {
        const info = status ? ` [${status}]` : ''
        console.log(info)
        // this.playingTrackElem.innerHTML = info
    }

    public seekToTimePosition(charPos: number, charPerc: number, audDur: number) {
        const seekTo = audDur * (charPerc/100)
        this.controller.model.currentTime = seekTo
        this.audioPlayerElem.currentTime = this.controller.model.currentTime
    }

    private _finaliseShareLinkLoadIfRqd() {
        if (this.controller.model.bookmarkSel.isAwaitingLoad()) {
            if (this.controller.model.bookmarkSel.stopTime > -1)
                this.controller.model.bookmarkSel.context = BookmarkedSelection.AWAITING_AUDIO_END
            else
                this.controller.model.bookmarkSel.context = BookmarkedSelection.CONTEXT
        }
        if (this.controller.model.bookmarkSel.lineRef) {
            const lineRefVals = AlbumPlayerState.fromLineRef(this.controller.model.bookmarkSel.lineRef)
            this.controller.container.homePageTabController.view.scrollToTextLineNumber(lineRefVals[0], lineRefVals[1])
        } else
            window.scroll(0, this.controller.model.currentScrollY)
    }

    static ELEM_ID = 'SuttaPlayerFabView' 
}