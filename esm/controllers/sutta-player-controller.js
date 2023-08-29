import { SuttaPlayerView } from '../views/sutta-player-view.js';
import { SuttaPlayerState } from '../models/sutta-player-state.js';
export class SuttaPlayerController {
    _audioStorage;
    _suttaStorage;
    _view;
    _model;
    constructor(suttaStorage, audioStorage) {
        this._suttaStorage = suttaStorage;
        this._audioStorage = audioStorage;
        this._model = new SuttaPlayerState();
        this._view = new SuttaPlayerView(this._model, this._suttaStorage, this._audioStorage);
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
        this._view.aboutSummaryReferenceElem.onclick = async () => {
            this._view.toggleAboutInfo();
        };
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
    }
    async _onAudioEnded() {
        this._view.updatePlayingSuttaInfo(this._model.audioSel.baseRef, 'played');
        if (this._model.playNext) {
            const fileList = this._suttaStorage.querySuttaReferences(this._model.audioSel.collectionIndex);
            if (this._model.audioSel.suttaIndex < fileList.length - 1) {
                this._model.audioSel.suttaIndex++;
                this._model.audioSel.updateBaseRef(this._suttaStorage);
                await this._onLoadAudio(this._model.audioSel);
            }
        }
    }
    _onCollectionSelected(forceColIdx) {
        this._model.navSel.collectionIndex = (forceColIdx === null) ? Number(this._view.collectionElem.value) : forceColIdx;
        this._model.navSel.suttaIndex = -1;
        this._view.suttaElem.selectedIndex = 0;
        this._model.navSel.updateBaseRef(this._suttaStorage);
        this._view.loadSuttasList();
    }
    _onSuttaSelected(forceSuttaIdx) {
        this._model.navSel.suttaIndex = (forceSuttaIdx === null) ? Number(this._view.suttaElem.value) : forceSuttaIdx;
        this._model.navSel.updateBaseRef(this._suttaStorage);
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
}
//# sourceMappingURL=sutta-player-controller.js.map