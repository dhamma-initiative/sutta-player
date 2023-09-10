import { SuttaPlayerState } from "../models/sutta-player-state.js"
import { DeferredPromise } from "../runtime/deferred-promise.js"
import { SuttaPlayerView } from "../views/sutta-player-view.js"
import { SuttaPlayerController } from "./sutta-player-controller.js"

export class FabController {
    private _model: SuttaPlayerState
    private _view: SuttaPlayerView
    private _mainCtrl: SuttaPlayerController
    private _audDurPromise: DeferredPromise<number>

    public constructor(mdl: SuttaPlayerState, vw: SuttaPlayerView, ctrl: SuttaPlayerController) {
        this._model = mdl
        this._view = vw
        this._mainCtrl = ctrl
    }

    public async setup() {
        this._registerListeners()
    }

    public async tearDown(): Promise<boolean> {
        this._view = null
        this._model = null
        return true
    }

    public notifyDuration(dur: number) {
        if (this._audDurPromise)
            this._audDurPromise.resolve(this._view.audioPlayerElem.duration)
    }

    private _registerListeners() {
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
        this._mainCtrl._onLoadIntoNavSelector(this._model.textSel)
        this._audDurPromise = new DeferredPromise<number>()
        const alreadyLoaded = await this._mainCtrl._onLoadAudio(this._model.textSel)
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
            const deleted = await this._mainCtrl._audioStore.removeFromCache(this._model.audioSel.baseRef)
            if (deleted)
                this._mainCtrl.showUserMessage(`Partial cache removed. Please try reloading...`)
        } else
            this._view.seekToTimePosition(lineRefVals[1], lineRefVals[2], audDur)
    }
}