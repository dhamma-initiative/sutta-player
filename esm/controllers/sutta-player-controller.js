import { SuttaPlayerView } from '../views/sutta-player-view.js';
import { SuttaPlayerState, SuttaSelection } from '../models/sutta-player-state.js';
import { DeferredPromise } from '../runtime/deferred-promise.js';
import { CacheUtils } from '../runtime/cache-utils.js';
export class SuttaPlayerController {
    _audioStore;
    _suttaStore;
    _view;
    _model;
    _cachedPromise;
    constructor(suttaStorage, audioStorage) {
        this._suttaStore = suttaStorage;
        this._audioStore = audioStorage;
        this._model = new SuttaPlayerState();
        this._view = new SuttaPlayerView(this._model, this._suttaStore, this._audioStore);
    }
    async setup() {
        this._model.load();
        await this._view.initialise();
        this._registerListeners();
    }
    async tearDown() {
        this._model.save();
    }
    _registerListeners() {
        this._view.collectionElem.onchange = async () => {
            if (this._view.collectionElem.selectedIndex !== this._model.navSel.collectionIndex)
                this._onCollectionSelected(null);
        };
        this._view.suttaElem.onclick = async () => {
            this._onSuttaSelected(null);
        };
        this._view.loadAudioElem.onclick = async () => {
            this._onLoadAudio(this._model.navSel);
        };
        this._view.loadTextElem.onclick = async () => {
            this._onLoadText(this._model.navSel);
        };
        this._view.loadRandomElem.onclick = async () => {
            this._onLoadRandom();
        };
        this._view.showAboutElem.onclick = async (event) => {
            this._view.toggleAboutInfo(event);
        };
        this._view.aboutDialogCloseElem.onclick = this._view.showAboutElem.onclick;
        this._view.audioPlayerElem.onloadeddata = async () => {
            this._view.updatePlayingSuttaInfo(this._model.audioSel.baseRef, 'loaded');
        };
        this._view.audioPlayerElem.onplay = async () => {
            this._view.updatePlayingSuttaInfo(this._model.audioSel.baseRef, 'playing');
        };
        this._view.audioPlayerElem.onpause = async () => {
            this._view.updatePlayingSuttaInfo(this._model.audioSel.baseRef, 'paused');
        };
        this._view.audioPlayerElem.onended = async () => {
            this._onAudioEnded();
        };
        this._view.audioPlayerElem.ontimeupdate = async () => {
            this._model.currentTime = this._view.audioPlayerElem.currentTime;
        };
        this._view.autoPlayElem.onchange = async () => {
            this._model.autoPlay = this._view.autoPlayElem.checked;
            this._view.refreshAudioControls();
        };
        this._view.playNextElem.onchange = async () => {
            this._model.playNext = this._view.playNextElem.checked;
            if (this._model.playNext)
                this._model.repeat = false;
            this._view.refreshAudioControls();
        };
        this._view.repeatElem.onchange = async () => {
            this._model.repeat = this._view.repeatElem.checked;
            if (this._model.repeat)
                this._model.playNext = false;
            this._view.refreshAudioControls();
        };
        this._view.linkTextToAudioElem.onchange = async () => {
            this._model.linkTextToAudio = this._view.linkTextToAudioElem.checked;
            if (this._model.linkTextToAudio)
                this._onLoadText(this._model.audioSel);
        };
        this._view.toggleDownloadElem.onchange = async () => {
            this._model.isDownloading = this._view.toggleDownloadElem.checked;
            this._onDownloadCollection(this._model.isDownloading);
        };
        this._view.audioCacherElem.oncanplaythrough = async () => {
            this._cachedPromise.resolve(true);
        };
        this._view.resetAppElem.onclick = async (event) => {
            localStorage.clear();
            CacheUtils.deleteCacheAndReloadApp(null);
            event.preventDefault();
        };
    }
    async _onAudioEnded() {
        this._view.updatePlayingSuttaInfo(this._model.audioSel.baseRef, 'played');
        if (this._model.playNext) {
            const fileList = this._suttaStore.querySuttaReferences(this._model.audioSel.collectionIndex);
            if (this._model.audioSel.suttaIndex < fileList.length - 1) {
                this._model.audioSel.suttaIndex++;
                this._model.audioSel.updateBaseRef(this._suttaStore);
                await this._onLoadAudio(this._model.audioSel);
            }
        }
    }
    _onCollectionSelected(forceColIdx) {
        this._model.navSel.collectionIndex = (forceColIdx === null) ? Number(this._view.collectionElem.value) : forceColIdx;
        this._model.navSel.suttaIndex = -1;
        this._view.suttaElem.selectedIndex = 0;
        this._model.navSel.updateBaseRef(this._suttaStore);
        this._view.loadSuttasList();
    }
    _onSuttaSelected(forceSuttaIdx) {
        this._model.navSel.suttaIndex = (forceSuttaIdx === null) ? Number(this._view.suttaElem.value) : forceSuttaIdx;
        this._model.navSel.updateBaseRef(this._suttaStore);
    }
    async _onLoadAudio(srcSel) {
        this._model.currentTime = 0;
        this._model.audioSel.read(srcSel);
        this._view.loadSuttaAudio();
        if (this._model.linkTextToAudio)
            await this._onLoadText(this._model.audioSel);
    }
    async _onLoadText(srcSel) {
        this._model.textSel.read(srcSel);
        await this._view.loadSuttaText();
    }
    async _onLoadRandom() {
        this._model.navSel.collectionIndex = Math.round(Math.random() * this._view.collectionElem.length);
        const fileList = this._suttaStore.querySuttaReferences(this._model.navSel.collectionIndex);
        this._model.navSel.suttaIndex = Math.round(Math.random() * fileList.length);
        this._model.navSel.updateBaseRef(this._suttaStore);
        this._view.collectionElem.selectedIndex = this._model.navSel.collectionIndex;
        this._view.suttaElem.selectedIndex = this._model.navSel.suttaIndex;
        await this._onLoadAudio(this._model.navSel);
    }
    async _onDownloadCollection(startDownloading) {
        if (startDownloading) {
            let downloadSel = new SuttaSelection('cache');
            downloadSel.collectionIndex = this._model.navSel.collectionIndex;
            const fileList = this._suttaStore.querySuttaReferences(this._model.navSel.collectionIndex);
            for (let i = 0; i < fileList.length; i++) {
                let progVal = Math.round(((i + 1) / fileList.length) * 100);
                this._view.downloadProgressElem.value = progVal;
                this._cachedPromise = new DeferredPromise();
                downloadSel.suttaIndex = i;
                downloadSel.updateBaseRef(this._suttaStore);
                const textBody = await this._suttaStore.querySuttaText(downloadSel.baseRef);
                this._view.loadSuttaAudioWith(downloadSel, this._view.audioCacherElem);
                let cont = await this._cachedPromise;
                if (!cont)
                    break;
            }
        }
        else
            this._cachedPromise.resolve(false);
        this._view.downloadProgressElem.value = 0;
        this._view.toggleDownloadElem.checked = false;
    }
}
//# sourceMappingURL=sutta-player-controller.js.map