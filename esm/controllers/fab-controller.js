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
        const fabSection = document.getElementById('fabSection');
        window.onscroll = () => {
            if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
                fabSection.style.display = "block";
            }
            else {
                fabSection.style.display = "none";
            }
        };
    }
    async _onSkipAudioToLine() {
        if (this._model.bookmarkLineRef === "")
            return;
        const currBookmarkLineRef = this._model.bookmarkLineRef;
        const lineRefVals = AlbumPlayerState.fromLineRef(this._model.bookmarkLineRef);
        this._mainCtrl._onLoadIntoNavSelector(this._model.textSel);
        this._audDurPromise = new DeferredPromise();
        const alreadyLoaded = await this._mainCtrl._onLoadAudio(this._model.textSel);
        if (alreadyLoaded)
            this._audDurPromise.resolve(this._view.audioPlayerElem.duration);
        this._model.bookmarkLineRef = currBookmarkLineRef;
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
            const deleted = await this._mainCtrl._audioStore.removeFromCache(this._model.audioSel.baseRef);
            if (deleted)
                this._mainCtrl.showUserMessage(`Partial cache removed. Please try reloading...`);
        }
        else
            this._view.seekToTimePosition(lineRefVals[1], lineRefVals[2], audDur);
    }
}
//# sourceMappingURL=fab-controller.js.map