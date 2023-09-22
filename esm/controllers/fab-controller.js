import { AlbumPlayerState } from "../models/album-player-state.js";
import { DeferredPromise } from "../runtime/deferred-promise.js";
export class FabController {
    _model;
    _view;
    _mainCtrl;
    _audDurPromise;
    constructor(mdl, vw, ctrl) {
        this._model = mdl;
        this._view = vw;
        this._mainCtrl = ctrl;
    }
    async setup() {
        this._registerListeners();
    }
    async tearDown() {
        this._view = null;
        this._model = null;
        return true;
    }
    notifyDuration(dur) {
        if (this._audDurPromise)
            this._audDurPromise.resolve(this._view.audioPlayerElem.duration);
    }
    _registerListeners() {
        this._view.scrollPlayToggleElem.onchange = async () => {
            if (this._view.scrollPlayToggleElem.checked)
                await this._view.audioPlayerElem.play();
            else
                this._view.audioPlayerElem.pause();
        };
        this._view.skipAudioToLineElem.onclick = async (event) => {
            event.preventDefault();
            await this._onSkipAudioToLine();
        };
        this._view.scrollTextWithAudioElem.onchange = async () => {
            this._model.scrollTextWithAudio = this._view.scrollTextWithAudioElem.checked;
        };
        this._view.gotoTopElem.onclick = async () => {
            window.scroll(0, 0);
        };
        this._registerDisplayListener();
        this._registerAudioSeekListerners();
        this._registerStartStopBookmarkListeners();
    }
    _registerAudioSeekListerners() {
        const skipsFwd5Sec = document.getElementById('skipsFwd5Sec');
        const skipsBack5Sec = document.getElementById('skipsBack5Sec');
        skipsFwd5Sec.onclick = async (e) => {
            e.preventDefault();
            if (this._model.audioState > 1) {
                this._view.audioPlayerElem.currentTime += 5;
                // this._mainCtrl.showUserMessage('skipping forward 5 seconds')
            }
        };
        skipsBack5Sec.onclick = async (e) => {
            e.preventDefault();
            if (this._model.audioState > 1) {
                this._view.audioPlayerElem.currentTime -= 5;
                // this._mainCtrl.showUserMessage('skipping backward 5 seconds')
            }
        };
    }
    _registerDisplayListener() {
        const rhsFabSection = document.getElementById('rhsFabSection');
        const lhsFabSection = document.getElementById('lhsFabSection');
        const centreFabSection = document.getElementById('centreFabSection');
        window.onscroll = () => {
            if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20)
                this._view.showHideContextControls(true);
            else
                this._view.showHideContextControls(false);
        };
    }
    _registerStartStopBookmarkListeners() {
        const setStartAtBookmark = document.getElementById('setStartAtBookmark');
        const setStopAtBookmark = document.getElementById('setStopAtBookmark');
        setStartAtBookmark.onclick = async (e) => {
            e.preventDefault();
            if (this._model.audioState > 1) {
                this._model.bookmarkSel.read(this._model.audioSel);
                this._model.bookmarkSel.set(this._view.audioPlayerElem.currentTime, null, null);
                this._mainCtrl.showUserMessage('Bookmarked audio start');
            }
        };
        setStopAtBookmark.onclick = async (e) => {
            e.preventDefault();
            if (this._model.audioState > 1) {
                this._model.bookmarkSel.read(this._model.audioSel);
                this._model.bookmarkSel.set(null, this._view.audioPlayerElem.currentTime, null);
                this._mainCtrl.showUserMessage('Bookmarked audio end');
            }
        };
    }
    async _onSkipAudioToLine() {
        if (!this._model.bookmarkSel.lineRef)
            return;
        const currBookmarkLineRef = this._model.bookmarkSel.lineRef;
        const lineRefVals = AlbumPlayerState.fromLineRef(this._model.bookmarkSel.lineRef);
        this._mainCtrl._onLoadIntoNavSelector(this._model.bookmarkSel);
        this._audDurPromise = new DeferredPromise();
        const alreadyLoaded = await this._mainCtrl._onLoadAudio(this._model.bookmarkSel);
        if (alreadyLoaded)
            this._audDurPromise.resolve(this._view.audioPlayerElem.duration);
        this._model.bookmarkSel.lineRef = currBookmarkLineRef;
        this._view.refreshSkipAudioToLine();
        await this._managePromisedDuration(lineRefVals);
        await this._view.audioPlayerElem.play();
    }
    async _managePromisedDuration(lineRefVals) {
        const timeOut = new Promise((res, rej) => {
            setTimeout(() => {
                if (this._audDurPromise !== null)
                    res(-1);
            }, 10000); // 10 sec
        });
        const audDur = await Promise.race([this._audDurPromise, timeOut]);
        this._audDurPromise = null;
        if (audDur === -1) {
            const deleted = await this._mainCtrl._albumStore.removeFromCache(this._model.audioSel.baseRef, false, true);
            if (deleted[0])
                this._mainCtrl.showUserMessage(`Partial cache removed. Please try reloading...`);
        }
        else
            this._view.seekToTimePosition(lineRefVals[1], lineRefVals[2], audDur);
    }
}
//# sourceMappingURL=fab-controller.js.map