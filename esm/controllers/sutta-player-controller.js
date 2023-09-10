import { SuttaPlayerView } from '../views/sutta-player-view.js';
import { SuttaPlayerState } from '../models/sutta-player-state.js';
import { OfflineController } from './offline-controller.js';
import { ResetAppController } from './resetapp-controller.js';
import { SearchController } from './search-controller.js';
import { SettingsController } from './settings-controller.js';
import { AboutController } from './about-controller.js';
import { FabController } from './fab-controller.js';
export class SuttaPlayerController {
    static VERSION = "v1.0.6";
    _audioStore;
    _suttaStore;
    _appRoot;
    _model;
    _view;
    _settingsController;
    _searchController;
    _fabController;
    _offlineController;
    _resetAppController;
    _aboutController;
    _lastScrollTime = 0;
    _lineSelectionCb = (event) => {
        this._onLineSelected(event);
    };
    constructor(appRoot, suttaStorage, audioStorage) {
        this._appRoot = appRoot;
        this._suttaStore = suttaStorage;
        this._audioStore = audioStorage;
        this._model = new SuttaPlayerState();
        this._view = new SuttaPlayerView(this._model, this._suttaStore, this._audioStore);
        this._settingsController = new SettingsController(this._model, this._view, this);
        this._searchController = new SearchController(this._model, this._view, this);
        this._fabController = new FabController(this._model, this._view, this);
        this._offlineController = new OfflineController(this._model, this._view, this);
        this._resetAppController = new ResetAppController(this._model, this._view, this);
        this._aboutController = new AboutController(this._model, this._view, this);
    }
    async setup() {
        this._injectVersionInfo();
        this._model.restore();
        this._loadShareLinkIfSpecified();
        if (this._model.navSel.baseRef === null)
            this._model.navSel.updateBaseRef(this._suttaStore);
        await this._view.initialise(this._lineSelectionCb);
        this._registerListeners();
        await this._settingsController.setup();
        await this._searchController.setup();
        await this._fabController.setup();
        await this._offlineController.setup();
        await this._resetAppController.setup();
        await this._aboutController.setup();
    }
    async tearDown() {
        let settingsSaveModel = await this._settingsController.tearDown();
        let srchSaveModel = await this._searchController.tearDown();
        let fabSaveModel = await this._fabController.tearDown();
        let offlineSaveModel = await this._offlineController.tearDown();
        let resetAppSaveModel = await this._resetAppController.tearDown();
        let aboutSaveModel = await this._aboutController.tearDown();
        if (settingsSaveModel && srchSaveModel && fabSaveModel && offlineSaveModel && resetAppSaveModel && aboutSaveModel)
            this._model.save();
        this._view = null;
        this._model = null;
    }
    showUserMessage(msg, dur) {
        this._view.showMessage(msg, dur);
    }
    _injectVersionInfo() {
        const htmlVerTxt = document.getElementById('appHtmlViewVer').textContent;
        document.getElementById('appJsCtrlVer').textContent = SuttaPlayerController.VERSION;
        console.log(`App HTML View version: ${htmlVerTxt}`);
        console.log(`App JS Controller version: ${SuttaPlayerController.VERSION}`);
    }
    _registerListeners() {
        this._registerNavigationListeners();
        this._registerDisplayListeners();
    }
    _registerNavigationListeners() {
        this._view.albumElem.onchange = async () => {
            if (this._view.albumElem.selectedIndex !== this._model.navSel.albumIndex)
                this._onAlbumSelected(null);
        };
        this._view.trackElem.onclick = async () => {
            this._onTrackSelected(null);
        };
        this._view.loadAudioElem.onclick = async () => {
            await this._onLoadAudio(this._model.navSel);
        };
        this._view.loadTextElem.onclick = async () => {
            await this._onLoadText(this._model.navSel);
        };
        this._view.loadRandomElem.onclick = async () => {
            await this._onLoadRandom();
        };
        this._view.shareLinkElem.onclick = async () => {
            this._onShareLink(this._model.navSel);
        };
    }
    _registerDisplayListeners() {
        this._view.audioPlayerElem.onloadedmetadata = async () => {
            this._model.audioState = 2;
            if (!isNaN(this._view.audioPlayerElem.duration))
                this._fabController.notifyDuration(this._view.audioPlayerElem.duration);
            this._view.scrollPlayToggleElem.disabled = true;
        };
        this._view.audioPlayerElem.onloadeddata = async () => {
            this._model.audioState = 3;
            this._view.updatePlayingTrackInfo(this._model.audioSel.baseRef, 'loaded');
            this._view.scrollPlayToggleElem.disabled = false;
        };
        this._view.audioPlayerElem.onplay = async () => {
            this._model.audioState = 4;
            this._view.updatePlayingTrackInfo(this._model.audioSel.baseRef, 'playing');
            this._lastScrollTime = 0;
            this._view.scrollPlayToggleElem.checked = true;
        };
        this._view.audioPlayerElem.onpause = async () => {
            this._model.audioState = 5;
            this._view.updatePlayingTrackInfo(this._model.audioSel.baseRef, 'paused');
            this._view.scrollPlayToggleElem.checked = false;
        };
        this._view.audioPlayerElem.onended = async () => {
            this._model.audioState = 6;
            this._view.scrollPlayToggleElem.checked = false;
            await this._onAudioEnded();
        };
        this._view.audioPlayerElem.ontimeupdate = async () => {
            const diff = this._view.audioPlayerElem.currentTime - this._lastScrollTime;
            if (Math.abs(diff) > 5) {
                this._lastScrollTime = this._view.audioPlayerElem.currentTime;
                this._view.syncTextPositionWithAudio();
            }
            this._model.currentTime = this._view.audioPlayerElem.currentTime;
        };
        this._view.linkNavToAudioElem.onclick = async (event) => {
            event.preventDefault();
            this._onLoadIntoNavSelector(this._model.audioSel);
            this.showUserMessage(`Navigation selection sync'd to ${this._model.audioSel.baseRef}`);
        };
        this._view.linkNavToTextElem.onclick = async (event) => {
            event.preventDefault();
            this._onLoadIntoNavSelector(this._model.textSel);
            this.showUserMessage(`Navigation selection sync'd to ${this._model.textSel.baseRef}`);
        };
    }
    async _onAudioEnded() {
        this._view.updatePlayingTrackInfo(this._model.audioSel.baseRef, 'played');
        if (this._model.playNext) {
            window.scroll(0, 0);
            const fileList = this._suttaStore.queryTrackReferences(this._model.audioSel.albumIndex);
            if (this._model.audioSel.trackIndex < fileList.length - 1) {
                this._model.audioSel.trackIndex++;
                this._model.audioSel.isLoaded = false;
                this._model.audioSel.updateBaseRef(this._suttaStore);
                await this._onLoadAudio(this._model.audioSel);
            }
        }
    }
    _onAlbumSelected(forceAlbIdx) {
        this._model.navSel.albumIndex = (forceAlbIdx === null) ? Number(this._view.albumElem.value) : forceAlbIdx;
        this._model.navSel.trackIndex = 0;
        this._view.trackElem.selectedIndex = this._model.navSel.trackIndex;
        this._model.navSel.updateBaseRef(this._suttaStore);
        this._view.loadTracksList();
    }
    _onTrackSelected(forceTrackIdx) {
        this._model.navSel.trackIndex = (forceTrackIdx === null) ? Number(this._view.trackElem.value) : forceTrackIdx;
        this._model.navSel.updateBaseRef(this._suttaStore);
    }
    async _onLoadAudio(srcSel) {
        if (this._model.audioSel.isSimilar(srcSel) && this._model.audioSel.isLoaded)
            return true;
        this._model.currentTime = 0;
        this._model.audioState = -1;
        this._model.audioSel.read(srcSel);
        this._view.loadTrackAudio();
        if (this._model.linkTextToAudio)
            await this._onLoadText(this._model.audioSel);
        return false;
    }
    async _onLoadText(srcSel) {
        if (this._model.textSel.isSimilar(srcSel) && this._model.textSel.isLoaded)
            return true;
        this._model.bookmarkLineRef = ''; // clear bookmark
        this._view.refreshSkipAudioToLine();
        this._model.textSel.read(srcSel);
        await this._view.loadTrackTextForUi(this._lineSelectionCb);
        return false;
    }
    _onLineSelected(event) {
        const elem = event.target;
        const lineNum = this._view.parseLineNumber(elem.id);
        if (!lineNum)
            return;
        const lineRef = this._view.createLineRefValues(lineNum);
        const lineRefVals = SuttaPlayerState.fromLineRef(lineRef);
        const textLen = elem.textContent.length;
        const rect = elem.getBoundingClientRect();
        const percDiff = lineRefVals[4] - lineRefVals[2];
        const adjPx = event.clientY - rect.top;
        const adjChars = Math.floor((adjPx / rect.height) * textLen);
        const adjPercDiff = Math.floor((adjPx / rect.height) * percDiff);
        lineRefVals[1] = lineRefVals[1] + adjChars;
        lineRefVals[2] = lineRefVals[2] + adjPercDiff;
        this._model.bookmarkLineRef = SuttaPlayerState.toLineRefUsingArr(lineRefVals);
        this._view.refreshSkipAudioToLine();
        this.showUserMessage(`Bookmarked line ${lineNum}`);
    }
    async _onLoadRandom() {
        this._model.navSel.albumIndex = Math.round(Math.random() * this._view.albumElem.length);
        const fileList = this._suttaStore.queryTrackReferences(this._model.navSel.albumIndex);
        this._model.navSel.trackIndex = Math.round(Math.random() * fileList.length);
        this._model.navSel.updateBaseRef(this._suttaStore);
        if (this._view.albumElem.selectedIndex !== this._model.navSel.albumIndex) {
            this._view.albumElem.selectedIndex = this._model.navSel.albumIndex;
            this._view.loadTracksList();
        }
        this._view.trackElem.selectedIndex = this._model.navSel.trackIndex;
        await this._onLoadAudio(this._model.navSel);
        await this._onLoadText(this._model.navSel);
    }
    _onShareLink(srcSel) {
        let baseRefHref = location.protocol + '//' + location.host + this._appRoot;
        baseRefHref += '#' + srcSel.baseRef + `?startTime=${this._model.currentTime}`;
        if (this._model.bookmarkLineRef !== '')
            baseRefHref += `&line=${this._model.bookmarkLineRef}`;
        navigator.clipboard.writeText(baseRefHref);
        this.showUserMessage('Share Link copied to clipboard');
    }
    _onLoadIntoNavSelector(srcSel) {
        this._model.navSel.read(srcSel);
        if (this._view.albumElem.selectedIndex !== this._model.navSel.albumIndex) {
            this._view.albumElem.selectedIndex = this._model.navSel.albumIndex;
            this._view.loadTracksList();
        }
        this._view.trackElem.selectedIndex = this._model.navSel.trackIndex;
        this.showUserMessage('Track loaded into Navigator selection');
    }
    _loadShareLinkIfSpecified() {
        let href = location.href;
        let url = new URL(href);
        if (url.hash) {
            href = href.replace('#', '');
            url = new URL(href);
            let baseRef = url.pathname.substring(this._appRoot.length);
            if (baseRef.startsWith('/'))
                baseRef = baseRef.substring(1);
            const urlSel = this._suttaStore.queryTrackSelection(baseRef);
            if (urlSel.albumIndex > -1 && urlSel.trackIndex > -1) {
                this._model.navSel.read(urlSel);
                this._model.audioSel.read(urlSel);
                this._model.textSel.read(urlSel);
                this._model.currentTime = Number(url.searchParams.get('startTime'));
                this._model.bookmarkLineRef = url.searchParams.get('line');
                this._view.refreshSkipAudioToLine();
                this._view.albumTrackSelectionElem.open = false;
            }
        }
    }
}
//# sourceMappingURL=sutta-player-controller.js.map