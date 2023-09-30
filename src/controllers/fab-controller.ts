import { AlbumPlayerState } from "../models/album-player-state.js"
import { SuttaPlayerView } from "../views/sutta-player-view.js"
import { SuttaPlayerController } from "./sutta-player-controller.js"

export class FabController {
    private _model: AlbumPlayerState
    private _view: SuttaPlayerView
    private _mainCtrl: SuttaPlayerController

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

    private _registerListeners() {
        this._registerNavigationListeners()
        this._registerAudioSeekListerners()
        this._registerStartStopBookmarkListeners()
        this._registerMaxAudioElemResizeListener()
        this._registerAudioStateChangeListener()
    }

    private _registerNavigationListeners() {
        this._view.gotoTopElem.onclick = async () => {
            window.scroll(0, 0)
        }
        this._view.tabSliderElem.onchange = async () => {
            this._mainCtrl.openTab(parseInt(this._view.tabSliderElem.value))
        }
    }

    private _registerAudioSeekListerners() {
        const skipsFwd5Sec = document.getElementById('skipsFwd5Sec')
        const skipsBack5Sec = document.getElementById('skipsBack5Sec')
        skipsFwd5Sec.onclick = async (e: Event) => {
            e.preventDefault()
            if (this._model.getAudioState() > 1) {
                this._view.audioPlayerElem.currentTime += 5
                // this._mainCtrl.showUserMessage('skipping forward 5 seconds')
            }
        }
        skipsBack5Sec.onclick = async (e: Event) => {
            e.preventDefault()
            if (this._model.getAudioState() > 1) {
                this._view.audioPlayerElem.currentTime -= 5
                // this._mainCtrl.showUserMessage('skipping backward 5 seconds')
            }
        }
        this._view.skipAudioToLineElem.onclick = async (event: Event) => {
            event.preventDefault()
            await this._onSkipAudioToLine()
        }
    }

    private _registerStartStopBookmarkListeners() {
        const setStartAtBookmark = document.getElementById('setStartAtBookmark')
        const setStopAtBookmark = document.getElementById('setStopAtBookmark')
        setStartAtBookmark.onclick = async (e: Event) => {
            e.preventDefault()
            if (this._model.getAudioState() > 1) {
                this._model.bookmarkSel.read(this._model.homeSel)
                this._model.bookmarkSel.set(this._view.audioPlayerElem.currentTime, null, null)
                this._mainCtrl.showUserMessage('Bookmarked audio start')
            }
        }
        setStopAtBookmark.onclick = async (e: Event) => {
            e.preventDefault()
            if (this._model.getAudioState() > 1) {
                this._model.bookmarkSel.read(this._model.homeSel)
                this._model.bookmarkSel.set(null, this._view.audioPlayerElem.currentTime, null)
                this._mainCtrl.showUserMessage('Bookmarked audio end')
            }
        }
    }

    private _registerMaxAudioElemResizeListener() {
        const rhsFabSection = document.getElementById('rhsFabSection')
        const maxRhsFabSection = <HTMLInputElement>document.getElementById('maxRhsFabSection')
        maxRhsFabSection.onchange = () => {
            if (maxRhsFabSection.checked)
                rhsFabSection.classList.add('fabSectionMax')

            else
                rhsFabSection.classList.remove('fabSectionMax')
        }
    }

    private _registerAudioStateChangeListener() {
        this._model.onAudioStateChange = (oldVal, newVal) => {
            let showAudioCtrls = newVal >= 3
            let lst = ['setStartAtBookmark', 'setStopAtBookmark', 'skipsBack5Sec', 'skipsFwd5Sec', 'skipAudioToLine', 'setStartAtBookmark', 'setStopAtBookmark']
            for (let i = 0; i < lst.length; i++) {
                const el = document.getElementById(lst[i])
                if (lst[i] === 'skipAudioToLine') {
                    el.style.display = (showAudioCtrls && this._model.bookmarkSel.lineRef) ? null : 'none'
                } else
                    el.style.display = showAudioCtrls ? null : 'none'
            } 
        }
    }

    private async _onSkipAudioToLine() {
        if (!this._model.bookmarkSel.lineRef)
            return
        const currBookmarkLineRef = this._model.bookmarkSel.lineRef
        const lineRefVals = AlbumPlayerState.fromLineRef(this._model.bookmarkSel.lineRef)
        await this._mainCtrl._onLoadAudio(this._model.bookmarkSel)
        this._model.bookmarkSel.lineRef = currBookmarkLineRef
        this._view.refreshSkipAudioToLine()
        await this._managePromisedDuration(lineRefVals)
        if (this._model.autoPlay)
            await this._view.audioPlayerElem.play()
    }

    private async _managePromisedDuration(lineRefVals: number[]) {
        const timeOut = new Promise<number>((res, rej) => {
            setTimeout(() => {
                if (this._mainCtrl.audDurWaitState === 0)
                    res(-1)
            }, 10000)   // 10 sec
        })
        const audDur = await Promise.race([this._mainCtrl.audDurWait, timeOut])
        if (audDur > -1) 
            this._view.seekToTimePosition(lineRefVals[1], lineRefVals[2], audDur)
    }
}