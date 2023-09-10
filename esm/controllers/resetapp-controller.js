import { CacheUtils } from "../runtime/cache-utils.js";
export class ResetAppController {
    _model;
    _view;
    _mainCtrl;
    _resetApp = false;
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
        return !this._resetApp;
    }
    _registerListeners() {
        this._view.resetAppMenuElem.onclick = async (event) => {
            this._view.toggleResetAppDialog(event);
        };
        this._view.resetAppCloseElem.onclick = this._view.resetAppMenuElem.onclick;
        this._view.resetAppConfirmElem.onclick = async (event) => {
            await this._onResetAppConfirm();
            this._view.toggleResetAppDialog(event);
        };
    }
    async _onResetAppConfirm() {
        this._resetApp = true;
        localStorage.clear();
        const keys = await caches.keys();
        for (let i = 0; i < keys.length; i++)
            await caches.delete(keys[i]);
        if (CacheUtils.ENABLE_CACHE) {
            const swReg = await navigator.serviceWorker.getRegistration();
            await swReg.unregister();
        }
        window.location.reload();
    }
}
//# sourceMappingURL=resetapp-controller.js.map