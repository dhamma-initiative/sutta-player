import { AlbumPlayerState } from "../models/album-player-state.js"
import { DeferredPromise } from "../runtime/deferred-promise.js"
import { SuttaPlayerView } from "../views/sutta-player-view.js"
import { SuttaPlayerController } from "./sutta-player-controller.js"

export class FabController {
    private _model: AlbumPlayerState
    private _view: SuttaPlayerView
    private _mainCtrl: SuttaPlayerController
    private _audDurPromise: DeferredPromise<number>

    public constructor(mdl: AlbumPlayerState, vw: SuttaPlayerView, ctrl: SuttaPlayerController) {
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
        this._view.ctxMenuToggleElem.onchange = async () => {
            this._view.showHideContextControls(this._view.ctxMenuToggleElem.checked)
        }
        this._view.ctxPlayToggleElem.onchange = async () => {
            if (this._view.ctxPlayToggleElem.checked)
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
        this._registerAudioSeekListerners()
        this._registerStartStopBookmarkListeners()
    }

    private _registerAudioSeekListerners() {
        const skipsFwd5Sec = document.getElementById('skipsFwd5Sec')
        const skipsBack5Sec = document.getElementById('skipsBack5Sec')
        skipsFwd5Sec.onclick = async (e: Event) => {
            e.preventDefault()
            if (this._model.audioState > 1) {
                this._view.audioPlayerElem.currentTime += 5
                // this._mainCtrl.showUserMessage('skipping forward 5 seconds')
            }
        }
        skipsBack5Sec.onclick = async (e: Event) => {
            e.preventDefault()
            if (this._model.audioState > 1) {
                this._view.audioPlayerElem.currentTime -= 5
                // this._mainCtrl.showUserMessage('skipping backward 5 seconds')
            }
        }
    }

    private _registerStartStopBookmarkListeners() {
        const setStartAtBookmark = document.getElementById('setStartAtBookmark')
        const setStopAtBookmark = document.getElementById('setStopAtBookmark')
        setStartAtBookmark.onclick = async (e: Event) => {
            e.preventDefault()
            if (this._model.audioState > 1) {
                this._model.bookmarkSel.read(this._model.audioSel)
                this._model.bookmarkSel.set(this._view.audioPlayerElem.currentTime, null, null)
                this._mainCtrl.showUserMessage('Bookmarked audio start')
            }
        }
        setStopAtBookmark.onclick = async (e: Event) => {
            e.preventDefault()
            if (this._model.audioState > 1) {
                this._model.bookmarkSel.read(this._model.audioSel)
                this._model.bookmarkSel.set(null, this._view.audioPlayerElem.currentTime, null)
                this._mainCtrl.showUserMessage('Bookmarked audio end')
            }
        }
    }

    private async _onSkipAudioToLine() {
        if (!this._model.bookmarkSel.lineRef)
            return
        const currBookmarkLineRef = this._model.bookmarkSel.lineRef
        const lineRefVals = AlbumPlayerState.fromLineRef(this._model.bookmarkSel.lineRef)
        await this._mainCtrl._onLoadIntoNavSelector(this._model.bookmarkSel)
        this._audDurPromise = new DeferredPromise<number>()
        const alreadyLoaded = await this._mainCtrl._onLoadAudio(this._model.bookmarkSel)
        if (alreadyLoaded)
            this._audDurPromise.resolve(this._view.audioPlayerElem.duration)
        this._model.bookmarkSel.lineRef = currBookmarkLineRef
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
            const deleted = await this._mainCtrl._albumStore.removeFromCache(this._model.audioSel.baseRef, false, true)
            if (deleted[0])
                this._mainCtrl.showUserMessage(`Partial cache removed. Please try reloading...`)
        } else
            this._view.seekToTimePosition(lineRefVals[1], lineRefVals[2], audDur)
    }
}