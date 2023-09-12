import { AlbumPlayerState } from "../models/album-player-state.js"
import { SuttaPlayerView } from "../views/sutta-player-view.js"
import { SuttaPlayerController } from "./sutta-player-controller.js"

export class AboutController {
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
        this._view.aboutMenuElem.onclick = async (event) => {
            await this._view.toggleAboutInfo(event)
        }
        this._view.aboutDialogCloseElem.onclick = this._view.aboutMenuElem.onclick
    }
}