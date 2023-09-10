import { SuttaPlayerState } from "../models/sutta-player-state.js"
import { SuttaPlayerView } from "../views/sutta-player-view.js"
import { SuttaPlayerController } from "./sutta-player-controller.js"

export class SettingsController {
    private _model: SuttaPlayerState
    private _view: SuttaPlayerView
    private _mainCtrl: SuttaPlayerController

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

    private _registerListeners() {
        this._view.autoPlayElem.onchange = async () => {
            this._model.autoPlay = this._view.autoPlayElem.checked
            this._view.refreshAudioControls()
        }
        this._view.playNextElem.onchange = async () => {
            this._model.playNext = this._view.playNextElem.checked
            if (this._model.playNext)
                this._model.repeat = false
            this._view.refreshAudioControls()
        }
        this._view.repeatElem.onchange = async () => {
            this._model.repeat = this._view.repeatElem.checked
            if (this._model.repeat)
                this._model.playNext = false
            this._view.refreshAudioControls()
        }
        this._view.linkTextToAudioElem.onchange = async () => {
            this._model.linkTextToAudio = this._view.linkTextToAudioElem.checked
            if (this._model.linkTextToAudio)
                await this._mainCtrl._onLoadText(this._model.audioSel)
        }
        this._view.showLineNumsElem.onchange = async () => {
            this._model.showLineNums = this._view.showLineNumsElem.checked
            this._view.toggleLineNums()
        }
        this._view.searchAlbumsElem.onchange = async () => {
            this._model.searchAlbums = this._view.searchAlbumsElem.selectedIndex
        }
        this._view.useRegExElem.onchange = async () => {
            this._model.useRegEx = this._view.useRegExElem.checked
        }
        this._view.ignoreDiacriticsElem.onchange = async () => {
            this._model.ignoreDiacritics = this._view.ignoreDiacriticsElem.checked
        }
        this._view.darkThemeElem.onchange = async () => {
            this._model.darkTheme = this._view.darkThemeElem.checked
            this._view.setColorTheme()
        }
    }
}