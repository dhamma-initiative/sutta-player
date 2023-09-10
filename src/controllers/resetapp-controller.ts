import { SuttaPlayerState } from "../models/sutta-player-state.js"
import { CacheUtils } from "../runtime/cache-utils.js"
import { SuttaPlayerView } from "../views/sutta-player-view.js"
import { SuttaPlayerController } from "./sutta-player-controller.js"

export class ResetAppController {
    private _model: SuttaPlayerState
    private _view: SuttaPlayerView
    private _mainCtrl: SuttaPlayerController
    private _resetApp = false 

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
        return !this._resetApp
    }

    private _registerListeners() {
        this._view.resetAppMenuElem.onclick = async (event) => {
            this._view.toggleResetAppDialog(event)
        }
        this._view.resetAppCloseElem.onclick = this._view.resetAppMenuElem.onclick
        this._view.resetAppConfirmElem.onclick = async (event) => {
            await this._onResetAppConfirm()
            this._view.toggleResetAppDialog(event)
        }
    }

    private async _onResetAppConfirm() {
        this._resetApp = true
        localStorage.clear()
        const keys = await caches.keys()
        for (let i = 0; i < keys.length; i++) 
            await caches.delete(keys[i])      
        if (CacheUtils.ENABLE_CACHE) {
            const swReg = await navigator.serviceWorker.getRegistration()
            await swReg.unregister()
        }
        window.location.reload()
    }
}