import { AlbumPlayerState, BookmarkedSelection } from '../models/album-player-state.js';
import { DeferredPromise } from '../runtime/deferred-promise.js';
import { BaseController, BaseView } from './base-controller.js';
import { CatalogTabPageController } from './catalog-tab-page-controller.js';
import { HomePageTabController } from './home-tab-page-controller.js';
import { MainMenuController } from './main-menu-controller.js';
import { TabPageController } from './tab-page-controller.js';
export class SuttaPlayerContainer extends BaseController {
    static VERSION = "v1.0.13";
    albumStore;
    mainMenuController;
    homePageTabController;
    catalogTabPageController;
    tabPageList = [];
    controllerList = [];
    tabContextMenuMap = new Map();
    tabSelectedIndex = -1;
    _tabWndScrollPosMap = new Map();
    _playlistIteratorMap = new Map();
    appRoot;
    _lastScrollTime = 0;
    audDurationWait = new DeferredPromise();
    audDurationWaitState;
    constructor(appRoot, albumStorage) {
        const bookmark = new BookmarkedSelection(appRoot);
        const model = new AlbumPlayerState(bookmark);
        super(model, null);
        this.container = this;
        this.appRoot = appRoot;
        this.albumStore = albumStorage;
    }
    async _createView() {
        this.view = new SuttaPlayerFabView(this);
    }
    async setup() {
        this._injectVersionInfo();
        this.model.restore();
        await super.setup();
        this.mainMenuController = new MainMenuController(this.model, this);
        this.homePageTabController = new HomePageTabController(this.model, this);
        this.catalogTabPageController = new CatalogTabPageController(this.model, this);
        for (let i = 0; i < this.controllerList.length; i++)
            await this.controllerList[i].setup();
        this.openTab(0);
        this._preparePlaylistIterator();
    }
    async tearDown() {
        this.albumStore.close();
        this.model.save();
        for (let i = 0; i < this.controllerList.length; i++)
            await this.controllerList[i].tearDown();
        this._playlistIteratorMap.clear();
        this._tabWndScrollPosMap.clear();
        this.view = null;
        this.model = null;
    }
    registerController(ctrl) {
        if (ctrl === this)
            return;
        this.controllerList.push(ctrl);
        if (ctrl instanceof TabPageController) {
            this.tabPageList[ctrl.getIndex()] = ctrl;
            const ctxMenuId = ctrl.getCtxMenuElementId();
            const ctxMenu = document.getElementById(ctxMenuId);
            if (ctxMenu) {
                this.tabContextMenuMap.set(ctrl.getIndex(), ctxMenu);
                this.view.moveToTabContextMenu(ctxMenu);
            }
        }
    }
    registerIterator(key, itr) {
        this._playlistIteratorMap.set(key, itr);
    }
    openTab(tabNum) {
        if (tabNum === this.tabSelectedIndex)
            return;
        if (this.tabSelectedIndex > -1) {
            this._tabWndScrollPosMap.set(this.tabSelectedIndex, window.scrollY);
            this.tabPageList[this.tabSelectedIndex].onExit();
        }
        this.tabSelectedIndex = tabNum;
        if (this.tabSelectedIndex > -1) {
            let wndScrollY = this._tabWndScrollPosMap.get(tabNum);
            if (wndScrollY)
                window.scroll(0, wndScrollY);
            this.tabPageList[this.tabSelectedIndex].onEnter();
        }
        this.mainMenuController.view.viewMenuOptions[tabNum].checked = true;
        this.view.tabSliderElem.value = `${tabNum}`;
    }
    showUserMessage(msg, dur) {
        this.view.showMessage(msg, dur);
    }
    _injectVersionInfo() {
        const htmlVerTxt = document.getElementById('appHtmlViewVer').textContent;
        document.getElementById('appJsCtrlVer').textContent = SuttaPlayerContainer.VERSION;
        console.log(`App HTML View version: ${htmlVerTxt}`);
        console.log(`App JS Controller version: ${SuttaPlayerContainer.VERSION}`);
    }
    async _registerListeners() {
        this._registerContextMenuListners();
        this._registerNavigationListeners();
        this._registerAudioPlayerListeners();
    }
    _registerContextMenuListners() {
        this.view.ctxMenuToggleElem.onclick = () => {
            const isOpen = this.view.isCtxMenuToggleOpen();
            if (isOpen)
                this.view.ctxMenuToggleIconElem.removeAttribute('color');
            else
                this.view.ctxMenuToggleIconElem.setAttribute('color', 'medium');
            this.view.showHideContextControls(!isOpen);
        };
        this.view.shareLinkElem.onclick = async (e) => {
            e.preventDefault();
            this._onShareLink();
        };
        this._registerPreviousNextListeners();
        this._registerSkipBackForwardListeners();
        this._registerBookmarkListeners();
    }
    _registerPreviousNextListeners() {
        this.view.previousTrackElem.onclick = async (e) => {
            if (this.model.playlistIterator) {
                if (await this.model.playlistIterator.prev())
                    await this._loadTrack(this.model.playlistIterator.current());
            }
        };
        this.view.nextTrackElem.onclick = async (e) => {
            if (this.model.playlistIterator) {
                if (await this.model.playlistIterator.next())
                    await this._loadTrack(this.model.playlistIterator.current());
            }
        };
    }
    _registerSkipBackForwardListeners() {
        this.view.skipsFwd5SecElem.onclick = async (e) => {
            e.preventDefault();
            if (this.model.getAudioState() > 1)
                this.view.audioPlayerElem.currentTime += 5;
        };
        this.view.skipsBack5SecElem.onclick = async (e) => {
            e.preventDefault();
            if (this.model.getAudioState() > 1)
                this.view.audioPlayerElem.currentTime -= 5;
        };
    }
    _registerBookmarkListeners() {
        this.view.setStartAtBookmarkElem.onclick = async (e) => {
            e.preventDefault();
            if (this.model.getAudioState() > 1) {
                this.model.bookmarkSel.read(this.model.homeSel);
                this.model.bookmarkSel.setDetails(null, this.view.audioPlayerElem.currentTime, null);
                this.container.showUserMessage('Bookmarked audio start');
            }
        };
        this.view.setStopAtBookmarkElem.onclick = async (e) => {
            e.preventDefault();
            if (this.model.getAudioState() > 1) {
                this.model.bookmarkSel.read(this.model.homeSel);
                this.model.bookmarkSel.setDetails(null, null, this.view.audioPlayerElem.currentTime);
                this.container.showUserMessage('Bookmarked audio end');
            }
        };
        this.view.clearBookmarkPositionsElem.onclick = async (e) => {
            e.preventDefault();
            this.model.bookmarkSel.setDetails(null, -1, -1);
            this.container.showUserMessage('Cleared bookmark text & audio positions');
        };
    }
    _registerNavigationListeners() {
        this.view.gotoTopElem.onclick = async () => {
            window.scroll(0, 0);
        };
        this.view.tabSliderElem.onchange = async () => {
            this.openTab(parseInt(this.view.tabSliderElem.value));
        };
    }
    _registerAudioPlayerListeners() {
        this.view.audioPlayerElem.ondurationchange = async (e) => {
            if (!isNaN(this.view.audioPlayerElem.duration))
                this.audDurationWait.resolve(this.view.audioPlayerElem.duration);
        };
        this.view.audioPlayerElem.onloadedmetadata = async (e) => {
            this.model.setAudioState(2);
        };
        this.view.audioPlayerElem.onloadeddata = async (e) => {
            this.model.setAudioState(3);
            this.view.updatePlayingTrackInfo(this.model.homeSel.baseRef, 'audio loaded');
        };
        this.view.audioPlayerElem.onplay = async (e) => {
            this.model.setAudioState(4);
            this.view.updatePlayingTrackInfo(this.model.homeSel.baseRef, 'audio playing');
            this._lastScrollTime = 0;
        };
        this.view.audioPlayerElem.onpause = async (e) => {
            this.model.setAudioState(5);
            this.view.updatePlayingTrackInfo(this.model.homeSel.baseRef, 'audio paused');
            this.model.bookmarkSel.cancelAwaitingAudioEndIfRqd();
        };
        this.view.audioPlayerElem.onended = async (e) => {
            this.model.setAudioState(6);
            this.model.bookmarkSel.cancelAwaitingAudioEndIfRqd();
            await this._onAudioEnded();
        };
        this.view.audioPlayerElem.ontimeupdate = async (e) => {
            const diff = this.view.audioPlayerElem.currentTime - this._lastScrollTime;
            if (Math.abs(diff) > 5) {
                this._lastScrollTime = this.view.audioPlayerElem.currentTime;
                this.homePageTabController.view.syncTextPositionWithAudio();
            }
            this.model.currentTime = this.view.audioPlayerElem.currentTime;
            if (this.model.homeSel.stopTime !== null && this.model.currentTime > this.model.homeSel.stopTime) {
                e.preventDefault();
                this.view.audioPlayerElem.pause();
                await this._onAudioEnded();
            }
            else if (this.model.bookmarkSel.isAwaitingAudioEnd()) {
                if (this.model.currentTime >= this.model.bookmarkSel.stopTime) {
                    this.model.bookmarkSel.cancelAwaitingAudioEndIfRqd();
                    this.view.audioPlayerElem.pause();
                }
            }
        };
    }
    async _onAudioEnded() {
        this.view.updatePlayingTrackInfo(this.model.homeSel.baseRef, 'played');
        if (this.model.playNext) {
            if (this.model.playlistIterator) {
                if (await this.model.playlistIterator.next()) {
                    await this._loadTrack(this.model.playlistIterator.current());
                }
            }
        }
    }
    async _loadTrack(srcSel) {
        this.openTab(0);
        if (this.model.homeSel.isSimilar(srcSel) && this.model.homeSel.isLoaded)
            return true;
        this.model.bookmarkSel.read(srcSel);
        this.homePageTabController.view.refreshSkipAudioToLine();
        this.model.homeSel.read(srcSel);
        await this.homePageTabController.loadTrackText();
        if (this.model.loadAudioWithText)
            await this._onLoadAudio(srcSel);
        return false;
    }
    async _onLoadAudio(srcSel) {
        this.model.currentTime = srcSel.startTime ? srcSel.startTime : 0;
        this.model.homeSel.read(srcSel);
        this.model.bookmarkSel.read(srcSel);
        const isNewAwaitDurRqd = [false];
        await this.view.loadTrackAudio(isNewAwaitDurRqd);
        if (isNewAwaitDurRqd[0])
            this.createAudioDurationWait();
    }
    createAudioDurationWait() {
        this.audDurationWait = new DeferredPromise();
        this.audDurationWaitState = 0; // pending
        this.audDurationWait.then(() => this.audDurationWaitState = 1, () => this.audDurationWaitState = -1);
    }
    async getAudioPositionAsPerc() {
        const audioCurr = this.view.audioPlayerElem.currentTime;
        const audioTotal = await this.audDurationWait; // should be same as this.audioPlayerElem.duration
        const audioPerc = audioCurr / audioTotal;
        return 100 * audioPerc;
    }
    _onShareLink() {
        let href = this.model.bookmarkSel.createLink();
        navigator.clipboard.writeText(href);
        let msg = 'Share Link copied to clipboard';
        let desc = "";
        if (this.model.bookmarkSel.baseRef)
            desc += `sutta ${this.model.bookmarkSel.baseRef}<br/>`;
        if (this.model.bookmarkSel.lineRef)
            desc += `line ⓘ ${this.model.bookmarkSel.lineRef}<br/>`;
        if (this.model.bookmarkSel.startTime > -1)
            desc += `audio ▶️ ${this.model.bookmarkSel.startTime}<br/>`;
        if (this.model.bookmarkSel.stopTime > -1)
            desc += `audio ⏹️ ${this.model.bookmarkSel.stopTime}`;
        if (desc.length > 0)
            msg = `<p>${msg}</p><p>${desc}</p>`;
        this.container.showUserMessage(msg);
    }
    _preparePlaylistIterator() {
        this.model.playlistIterator = this._playlistIteratorMap.get(this.model.lastPlaylistIterator);
        this.model.playlistIterator.setContext(this.model.homeSel);
    }
}
export class SuttaPlayerFabView extends BaseView {
    audioPlayerElem = document.getElementById('audioPlayer');
    previousTrackElem = document.getElementById('previousTrack');
    skipsBack5SecElem = document.getElementById('skipsBack5Sec');
    skipsFwd5SecElem = document.getElementById('skipsFwd5Sec');
    nextTrackElem = document.getElementById('nextTrack');
    setStartAtBookmarkElem = document.getElementById('setStartAtBookmark');
    setStopAtBookmarkElem = document.getElementById('setStopAtBookmark');
    clearBookmarkPositionsElem = document.getElementById('clearBookmarkPositions');
    shareLinkElem = document.getElementById('shareLink');
    gotoTopElem = document.getElementById('gotoTop');
    tabSliderElem = document.getElementById('tabSlider');
    snackbarElem = document.getElementById('snackbar');
    ctxMenuToggleIconElem = document.getElementById('ctxMenuToggleIcon');
    ctxMenuToggleElem = document.getElementById('ctxMenuToggle');
    lhsFabSectionElem = document.getElementById('lhsFabSection');
    async bind() {
        const isNewAwaitDurRqd = [false];
        await this.loadTrackAudio(isNewAwaitDurRqd);
        this._finaliseShareLinkLoadIfRqd();
    }
    async refresh() {
        this.audioPlayerElem.autoplay = this.controller.model.autoPlay;
        this.audioPlayerElem.loop = this.controller.model.repeat;
        this.showHideContextControls(this.isCtxMenuToggleOpen());
    }
    showMessage(msg, dur = 3000) {
        this.snackbarElem.innerHTML = msg;
        this.snackbarElem.classList.add('show');
        setTimeout(() => {
            this.snackbarElem.classList.remove('show');
        }, dur);
    }
    showHideContextControls(show) {
        const dispStyle = show ? 'block' : 'none';
        const sections = ['lhsFabSection', 'centreFabSection', 'rhsFabSectionAudio', 'rhsFabSection'];
        for (let i = 0; i < sections.length; i++) {
            const elem = document.getElementById(sections[i]);
            elem.style.display = dispStyle;
        }
    }
    isCtxMenuToggleOpen() {
        let colorVal = this.ctxMenuToggleIconElem.getAttribute('color');
        return colorVal !== null;
    }
    async loadTrackAudio(isNewAwaitDurRqd) {
        const success = await this.loadTrackAudioWith(this.controller.model.homeSel, this.audioPlayerElem, isNewAwaitDurRqd);
        if (success) {
            this.audioPlayerElem.currentTime = this.controller.model.currentTime;
            if (this.controller.model.bookmarkSel.isAwaitingLoad()) {
                if (this.controller.model.currentTime > -1) {
                    // Uncaught (in promise) DOMException: play() failed because the user didn't interact with the document first. 
                    try {
                        await this.audioPlayerElem.play();
                    }
                    catch (err) { }
                }
            }
        }
        return success;
    }
    async loadTrackAudioWith(trackSel, audioElem, isNewAwaitDurRqd) {
        isNewAwaitDurRqd[0] = false;
        if (trackSel.baseRef === null)
            return false;
        const srcRef = this.controller.albumStore.queryTrackHtmlAudioSrcRef(trackSel.baseRef);
        if (srcRef === audioElem.src && this.controller.model.getAudioState() >= 1)
            return true;
        this.controller.model.setAudioState(0);
        audioElem.src = srcRef;
        isNewAwaitDurRqd[0] = true;
        this.controller.model.setAudioState(1);
        trackSel.isLoaded = true;
        return true;
    }
    moveToTabContextMenu(tabCtxMenuElem) {
        this.lhsFabSectionElem.append(tabCtxMenuElem);
    }
    updatePlayingTrackInfo(baseRef, status) {
        const info = status ? ` [${status}]` : '';
        console.log(info);
        // this.playingTrackElem.innerHTML = info
    }
    seekToTimePosition(charPos, charPerc, audDur) {
        const seekTo = audDur * (charPerc / 100);
        this.controller.model.currentTime = seekTo;
        this.audioPlayerElem.currentTime = this.controller.model.currentTime;
    }
    _finaliseShareLinkLoadIfRqd() {
        if (this.controller.model.bookmarkSel.isAwaitingLoad()) {
            if (this.controller.model.bookmarkSel.stopTime > -1)
                this.controller.model.bookmarkSel.context = BookmarkedSelection.AWAITING_AUDIO_END;
            else
                this.controller.model.bookmarkSel.context = BookmarkedSelection.CONTEXT;
        }
        if (this.controller.model.bookmarkSel.lineRef) {
            const lineRefVals = AlbumPlayerState.fromLineRef(this.controller.model.bookmarkSel.lineRef);
            this.controller.container.homePageTabController.view.scrollToTextLineNumber(lineRefVals[0], lineRefVals[1]);
        }
        else
            window.scroll(0, this.controller.model.currentScrollY);
    }
    static ELEM_ID = 'SuttaPlayerFabView';
}
//# sourceMappingURL=sutta-player-container.js.map